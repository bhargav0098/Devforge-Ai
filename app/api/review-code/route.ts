import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubRepo } from '@/lib/github';

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured. Add it to your Vercel environment variables.' }, { status: 500 });
  }
  try {
    const contentType = request.headers.get('content-type');
    
    let files: Array<{ path: string; content: string }> = [];

    // Handle file upload or GitHub URL
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const uploadedFiles = formData.getAll('files') as File[];

      // Validate sizes
      for (const file of uploadedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: `File "${file.name}" exceeds 10MB limit` },
            { status: 413 }
          );
        }
      }

      const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Total size exceeds 50MB limit' },
          { status: 413 }
        );
      }

      // Read file contents
      for (const file of uploadedFiles) {
        const content = await file.text();
        files.push({
          path: file.name,
          content: content.substring(0, 30000) // Limit to 30KB per file
        });
      }

    } else {
      const { githubUrl } = await request.json();
      
      if (!githubUrl) {
        return NextResponse.json(
          { error: 'GitHub URL is required' },
          { status: 400 }
        );
      }

      files = await fetchGitHubRepo(githubUrl);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No code files found to analyze' },
        { status: 400 }
      );
    }

    // Limit to first 5 files to avoid rate limits
    const filesToAnalyze = files.slice(0, 5);

    // SIMPLIFIED PROMPT - Returns valid JSON consistently
    const prompt = `Analyze code for security and quality issues. Return ONLY JSON (no markdown, no backticks).

CODE FILES:
${filesToAnalyze.map(f => `
FILE: ${f.path}
${f.content.substring(0, 1000)}
`).join('\n')}

Find 3-5 REAL issues. Return this EXACT JSON structure:

{"issues":[{"id":"1","severity":"critical","category":"security","title":"SQL Injection","file":"app.js","line":25,"code_snippet":"db.query('SELECT * FROM users WHERE id=' + userId)","problem":"Direct SQL concatenation","impact":"Database compromise","fix":"db.query('SELECT * FROM users WHERE id=$1',[userId])","explanation":"Use parameterized queries"},{"id":"2","severity":"medium","category":"performance","title":"N+1 Query","file":"users.js","line":45,"code_snippet":"for(user of users){await getOrders(user.id)}","problem":"Multiple queries in loop","impact":"Slow performance","fix":"const orders=await getOrdersByUserIds(userIds)","explanation":"Batch queries"}],"summary":{"critical":1,"medium":1,"low":0}}

Focus on:
- SQL injection (string concatenation in queries)
- XSS (unescaped user input)
- Hardcoded secrets
- Missing error handling
- Performance issues

Return ONLY the JSON object.`;

    // Call Gemini
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // Very low for consistent JSON
            maxOutputTokens: 4096,
            topP: 0.8
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Wait 60 seconds and try again.' },
          { status: 429 }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    let text = data.candidates[0].content.parts[0].text;

    // AGGRESSIVE JSON PARSING - Handles all edge cases
    let parsed;
    
    try {
      // Attempt 1: Direct parse
      parsed = JSON.parse(text);
      
    } catch (e1) {
      
      try {
        // Attempt 2: Remove markdown
        let cleaned = text.trim();
        cleaned = cleaned.replace(/```json\s*/gi, '');
        cleaned = cleaned.replace(/```\s*/g, '');
        cleaned = cleaned.trim();
        
        parsed = JSON.parse(cleaned);
        
      } catch (e2) {
        
        try {
          // Attempt 3: Extract between braces
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          
          if (start === -1 || end === -1 || start >= end) {
            throw new Error('No JSON braces found');
          }
          
          let extracted = text.substring(start, end + 1);
          parsed = JSON.parse(extracted);
          
        } catch (e3) {
          
          try {
            // Attempt 4: Find "issues" array and manually construct
            const issuesMatch = text.match(/"issues"\s*:\s*\[(.*?)\]/s);
            
            if (!issuesMatch) {
              throw new Error('No issues array found');
            }
            
            // Build minimal valid response
            parsed = {
              issues: [],
              summary: { critical: 0, medium: 0, low: 0 }
            };
            
            // Try to parse the issues array
            try {
              const issuesStr = '[' + issuesMatch[1] + ']';
              const issuesArray = JSON.parse(issuesStr);
              parsed.issues = issuesArray;
              
              // Calculate summary
              parsed.summary = {
                critical: issuesArray.filter((i: any) => i.severity === 'critical').length,
                medium: issuesArray.filter((i: any) => i.severity === 'medium').length,
                low: issuesArray.filter((i: any) => i.severity === 'low').length
              };
              
              
            } catch (issueParseError) {
              // Return empty issues if can't parse
            }
            
          } catch (e4: any) {
            
            return NextResponse.json({
              error: 'Failed to parse AI response',
              hint: 'The AI returned invalid JSON. Try uploading different files or fewer files.',
              details: e4.message,
              sample: text.substring(0, 500)
            }, { status: 500 });
          }
        }
      }
    }

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({
        error: 'Invalid response structure',
        type: typeof parsed
      }, { status: 500 });
    }

    // Ensure issues array exists
    if (!Array.isArray(parsed.issues)) {
      parsed.issues = [];
    }

    // Ensure summary exists
    if (!parsed.summary) {
      parsed.summary = {
        critical: parsed.issues.filter((i: any) => i.severity === 'critical').length,
        medium: parsed.issues.filter((i: any) => i.severity === 'medium').length,
        low: parsed.issues.filter((i: any) => i.severity === 'low').length
      };
    }

    // Add IDs if missing
    parsed.issues = parsed.issues.map((issue: any, idx: number) => ({
      id: issue.id || `issue-${idx + 1}`,
      severity: issue.severity || 'medium',
      category: issue.category || 'quality',
      title: issue.title || 'Code Issue',
      file: issue.file || 'unknown',
      line: issue.line || 1,
      code_snippet: issue.code_snippet || '',
      problem: issue.problem || 'Issue detected',
      impact: issue.impact || 'May cause problems',
      fix: issue.fix || 'Review and fix',
      explanation: issue.explanation || 'See fix above'
    }));


    return NextResponse.json({
      success: true,
      files: files.map(f => ({ path: f.path })),
      issues: parsed.issues,
      summary: parsed.summary
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Failed to review code',
      details: error.stack
    }, { status: 500 });
  }
}