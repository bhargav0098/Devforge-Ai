# DevForge AI

AI-powered developer toolkit with three core tools:
- **Architecture Builder** — Design system architecture visually, generate full-stack code
- **Code Reviewer** — Upload files or paste a GitHub URL for AI-powered code review
- **Docs Generator** — Auto-generate documentation from your GitHub repo

---

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Push to GitHub
```bash
# In the DevForge-Ai folder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no build settings needed
4. Add **Environment Variables** (Settings → Environment Variables):
   - `GEMINI_API_KEY` = your key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - `GITHUB_TOKEN` = optional, for higher GitHub API rate limits
5. Click **Deploy**

---

## 🛠 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local
# Then edit .env.local and add your GEMINI_API_KEY

# 3. Start dev server
npm run dev

# 4. Open http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Get from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GITHUB_TOKEN` | Optional | GitHub personal access token for higher API rate limits |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **AI**: Google Gemini 2.5 Flash
- **Diagramming**: ReactFlow
- **Code Preview**: CodeSandbox Sandpack
- **State**: Zustand
