import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured. Add it to your Vercel environment variables.' }, { status: 500 });
  }
  try {
    const { nodes, customizations } = await request.json();
    
    // Validate inputs
    const frontend = nodes.filter((n: any) => n.data?.category === 'frontend');
    const backend = nodes.filter((n: any) => n.data?.category === 'backend');
    const database = nodes.filter((n: any) => n.data?.category === 'database');

    if (frontend.length !== 1 || backend.length !== 1 || database.length === 0) {
      return NextResponse.json(
        { error: 'Invalid architecture. Need 1 frontend + 1 backend + 1+ database' },
        { status: 400 }
      );
    }

    const projectName = customizations?.projectName || 'MyApp';
    const projectSlug = projectName.toLowerCase().replace(/\s+/g, '-');

    // MINIMALIST PROMPT - Generates complete but concise files
    const prompt = `Generate a complete ${projectName} application. Return ONLY valid JSON (no markdown, no explanations).

CRITICAL: All frontend files MUST have "frontend/" prefix, all backend files MUST have "backend/" prefix.

REQUIRED FILE STRUCTURE:
{
  "files": [
    {"path": "frontend/package.json", "content": "..."},
    {"path": "frontend/index.html", "content": "..."},
    {"path": "frontend/vite.config.ts", "content": "..."},
    {"path": "frontend/src/main.tsx", "content": "COMPLETE REACT ENTRY POINT"},
    {"path": "frontend/src/App.tsx", "content": "COMPLETE APP COMPONENT"},
    {"path": "frontend/src/index.css", "content": "TAILWIND CSS"},
    {"path": "frontend/tsconfig.json", "content": "..."},
    {"path": "backend/server.js", "content": "COMPLETE EXPRESS SERVER"},
    {"path": "backend/package.json", "content": "..."}
  ],
  "dependencies": {
    "frontend": {"react": "^18.2.0", "react-dom": "^18.2.0", "vite": "^4.3.9"},
    "backend": {"express": "^4.18.2", "cors": "^2.8.5"}
  },
  "setup_instructions": "npm install in both folders, then npm run dev"
}

FRONTEND REQUIREMENTS:
- Use Vite + React + TypeScript
- frontend/src/main.tsx MUST import and render App
- frontend/index.html MUST have <div id="root"></div>
- frontend/package.json MUST have "type": "module" and Vite scripts

BACKEND REQUIREMENTS:
- Use Express + Node.js
- backend/server.js MUST start on port 3000
- Include CORS middleware

USER REQUIREMENTS:
${customizations?.userPrompt || 'Simple starter app'}

DESIGN:
${customizations?.design ? JSON.stringify(customizations.design) : 'Clean modern UI'}

Generate ALL files with COMPLETE working code. Keep concise but functional.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

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
            temperature: 0.3,
            maxOutputTokens: 8192,
            topP: 0.95
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please wait 1 minute.' }, { status: 429 });
      }
      const err = await response.text();
      return NextResponse.json({ error: `API error: ${response.status} - ${err.substring(0, 100)}` }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    let text = data.candidates[0].content.parts[0].text;

    // ROBUST PARSING - Handles incomplete JSON
    let parsed;
    try {
      text = text.trim()
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/, '')  // Remove everything before first {
        .replace(/[^}]*$/, ''); // Remove everything after last }

      
      // STRATEGY: Parse incrementally if full parse fails
      try {
        parsed = JSON.parse(text);
      } catch (fullError) {
        
        parsed = {
          files: [] as any[],
          dependencies: { frontend: {}, backend: {} },
          setup_instructions: 'npm install && npm run dev'
        };

        // Regex to find individual file objects: {"path": "...", "content": "..."}
        // This handles cases where the main array is not closed.
        const fileRegex = /\{\s*"path"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
        const fileRegexSwapped = /\{\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"path"\s*:\s*"([^"]+)"\s*\}/g;
        
        let match;
        while ((match = fileRegex.exec(text)) !== null) {
          try {
            parsed.files.push({
              path: match[1],
              content: JSON.parse(`"${match[2]}"`) // Use JSON.parse to handle escaped characters correctly
            });
          } catch (e) { /* skip malformed match */ }
        }

        while ((match = fileRegexSwapped.exec(text)) !== null) {
          try {
            const path = match[2];
            if (!parsed.files.some((f: any) => f.path === path)) {
              parsed.files.push({
                path: path,
                content: JSON.parse(`"${match[1]}"`)
              });
            }
          } catch (e) { /* skip */ }
        }
        
      }

      // Validate
      if (!parsed.files?.length) throw new Error('No files generated');
      
      // Ensure prefixes
      parsed.files = parsed.files.map((f: any) => {
        if (!f.path.startsWith('frontend/') && !f.path.startsWith('backend/')) {
          f.path = (f.path.includes('server') ? 'backend/' : 'frontend/') + f.path;
        }
        return f;
      });


    } catch (error: any) {
      
      return NextResponse.json({
        error: 'AI returned invalid format',
        details: error.message,
        hint: 'Try clicking Generate again - sometimes AI response is incomplete',
        rawPreview: text.substring(0, 500)
      }, { status: 500 });
    }


    // Add defaults
    if (!parsed.dependencies) {
      parsed.dependencies = {
        frontend: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-router-dom": "^6.20.0",
          "axios": "^1.6.2",
          "tailwindcss": "^3.4.0",
          "concurrently": "^8.2.2"
        },
        backend: {
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "better-sqlite3": "^9.2.2"
        }
      };
    }

    if (!parsed.setup_instructions) {
      parsed.setup_instructions = '# Setup\n\n1. npm install\n2. npm run dev\n3. Open http://localhost:5173';
    }


    return NextResponse.json({
      success: true,
      data: parsed
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Generation failed'
    }, { status: 500 });
  }
}