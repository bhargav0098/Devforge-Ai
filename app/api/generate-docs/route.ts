import { NextRequest, NextResponse } from "next/server";

// Retry helper with exponential backoff
async function callGeminiWithRetry(prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY!,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 4096,
            },
          }),
        },
      );

      if (response.status === 429) {
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error("Rate limit exceeded after retries. Wait 60 seconds.");
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Fetch file list from a public GitHub repo using the Trees API
async function fetchGitHubFiles(
  githubUrl: string,
): Promise<{ name: string; path: string }[]> {
  // Parse owner/repo from URL like https://github.com/owner/repo or https://github.com/owner/repo/tree/branch
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match)
    throw new Error("Invalid GitHub URL. Use https://github.com/owner/repo");

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");

  // Get default branch info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "DevForge-AI",
    },
  });
  if (!repoRes.ok)
    throw new Error(`GitHub repo not found or is private: ${owner}/${repo}`);
  const repoData = await repoRes.json();
  const branch = repoData.default_branch || "main";

  // Get file tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "DevForge-AI",
      },
    },
  );
  if (!treeRes.ok)
    throw new Error("Failed to fetch repository file tree from GitHub");
  const treeData = await treeRes.json();

  const codeExtensions =
    /\.(js|jsx|ts|tsx|py|go|java|cpp|c|h|cs|rb|php|vue|svelte|rs|kt|swift)$/;
  const files = (treeData.tree || [])
    .filter(
      (item: any) => item.type === "blob" && codeExtensions.test(item.path),
    )
    .map((item: any) => ({
      name: item.path.split("/").pop() || item.path,
      path: item.path,
    }));

  if (files.length === 0)
    throw new Error("No code files found in the repository.");
  return files;
}

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }
  try {
    const { files, githubUrl, docTypes, style } = await request.json();

    const hasFiles = files && files.length > 0;
    const hasGithubUrl = githubUrl && githubUrl.trim();

    if (!hasFiles && !hasGithubUrl) {
      return NextResponse.json(
        { error: "Please upload files or provide a GitHub URL" },
        { status: 400 },
      );
    }

    if (!docTypes || docTypes.length === 0) {
      return NextResponse.json(
        { error: "No documentation types selected" },
        { status: 400 },
      );
    }


    // Resolve file list — either from uploaded files or from GitHub
    let resolvedFiles = hasFiles ? files : [];
    let repoContext = "";

    if (hasGithubUrl) {
      try {
        const githubFiles = await fetchGitHubFiles(githubUrl.trim());
        // Merge: prefer uploaded files if any, supplement with GitHub files
        if (!hasFiles) resolvedFiles = githubFiles;
        repoContext = `\nGITHUB REPO: ${githubUrl.trim()}`;
      } catch (ghError: any) {
        return NextResponse.json({ error: ghError.message }, { status: 400 });
      }
    }

    // Build concise prompt
    const prompt = `Generate documentation for this project.

FILES: ${resolvedFiles
      .slice(0, 10)
      .map((f: any) => f.name || f.path)
      .join(", ")} (${resolvedFiles.length} total)${repoContext}

STYLE: ${style || "technical"}

GENERATE: ${docTypes.join(", ")}

Return ONLY this JSON (no markdown):
{
  ${docTypes.includes("readme") ? '"readme": "# Project\\n\\n## Description\\nFull content here...",' : ""}
  ${docTypes.includes("apiDocs") ? '"apiDocs": "# API Documentation\\n\\nFull content here...",' : ""}
  ${docTypes.includes("deployment") ? '"deployment": "# Deployment Guide\\n\\nFull content here...",' : ""}
  ${docTypes.includes("contributing") ? '"contributing": "# Contributing\\n\\nFull content here..."' : ""}
}

${
  docTypes.includes("readme")
    ? `
README must include:
- Project title and description
- Installation steps (npm install)
- Usage instructions (npm run dev)
- Tech stack
- Features list
`
    : ""
}

${
  docTypes.includes("apiDocs")
    ? `
API DOCS must include:
- Base URL
- Auth method
- Each endpoint: method, path, request, response, example
`
    : ""
}

${
  docTypes.includes("deployment")
    ? `
DEPLOYMENT must include:
- Prerequisites
- Environment variables
- Docker setup (if applicable)
- Vercel/Railway deployment steps
`
    : ""
}

Keep documentation concise and practical. Use markdown format. Return ONLY JSON.`;

    // Call with retry logic
    const data = await callGeminiWithRetry(prompt);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON
    let parsed;
    try {
      let cleaned = text.trim();
      cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON found");
      }

      cleaned = cleaned.substring(start, end + 1);
      parsed = JSON.parse(cleaned);
    } catch (parseError: any) {
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          details: parseError.message,
          sample: text.substring(0, 500),
        },
        { status: 500 },
      );
    }

    // Validate at least one doc was generated
    const generatedDocs = Object.keys(parsed).filter((key) =>
      ["readme", "apiDocs", "deployment", "contributing"].includes(key),
    );

    if (generatedDocs.length === 0) {
      return NextResponse.json(
        {
          error: "No documentation generated",
          received: Object.keys(parsed),
        },
        { status: 500 },
      );
    }


    return NextResponse.json({
      success: true,
      docs: parsed,
    });
  } catch (error: any) {

    if (error.message.includes("Rate limit")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait 60 seconds and try again.",
          hint: "Too many requests to Gemini API. Try again in 1 minute.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to generate documentation",
      },
      { status: 500 },
    );
  }
}
