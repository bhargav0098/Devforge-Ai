import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();


    // Build CodeSandbox files (frontend only) - CORRECTED PATHS
    const sandboxFiles: Record<string, { content: string }> = {};

    files
      .filter((f: any) => f.path.startsWith('frontend/'))
      .forEach((file: any) => {
        // Remove "frontend/" prefix completely
        let cleanPath = file.path.replace('frontend/', '');
        
        // CodeSandbox expects certain paths at root level
        // src/App.js should be "src/App.js" NOT "frontend/src/App.js"
        sandboxFiles[cleanPath] = { content: file.content };
      });


    // CRITICAL: Ensure required files exist
    const requiredFiles = {
      'package.json': !sandboxFiles['package.json'],
      'public/index.html': !sandboxFiles['public/index.html'],
      'src/index.js': !sandboxFiles['src/index.js'] && !sandboxFiles['src/index.tsx']
    };


    // Detect build tool from generated files
    const isVite = files.some((f: any) => f.path.includes('vite.config'));
    const isTypeScript = files.some((f: any) => f.path.endsWith('.tsx') || f.path.endsWith('.ts'));

    // Add package.json if missing
    if (!sandboxFiles['package.json']) {
      sandboxFiles['package.json'] = {
        content: JSON.stringify(isVite ? {
          name: 'preview',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.0.0',
            'typescript': '^5.0.0',
            vite: '^4.3.9'
          }
        } : {
          name: 'preview',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            'react-scripts': '5.0.1',
            'react-router-dom': '^6.8.0'
          },
          scripts: {
            'start': 'react-scripts start',
            'build': 'react-scripts build'
          },
          browserslist: {
            production: ['>0.2%', 'not dead'],
            development: ['last 1 chrome version']
          }
        }, null, 2)
      };
    }

    // Add public/index.html if missing
    if (!sandboxFiles['public/index.html']) {
      sandboxFiles['public/index.html'] = {
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>DevForge Preview</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`
      };
    }

    // Add src/index.js if missing (CRITICAL - entry point)
    if (!sandboxFiles['src/index.js'] && !sandboxFiles['src/index.tsx']) {
      sandboxFiles['src/index.js'] = {
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      };
    }

    // Add src/App.js if missing
    if (!sandboxFiles['src/App.js'] && !sandboxFiles['src/App.jsx'] && !sandboxFiles['src/App.tsx']) {
      sandboxFiles['src/App.js'] = {
        content: `import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀 DevForge Preview</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Your generated app will appear here</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '2rem' }}>
          If you see this, the AI didn't generate App.js correctly.
          <br />Try regenerating with simpler requirements.
        </p>
      </div>
    </div>
  );
}

export default App;`
      };
    }

    // Add basic CSS if missing
    if (!sandboxFiles['src/index.css']) {
      sandboxFiles['src/index.css'] = {
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: 'Courier New', monospace;
}`
      };
    }



    // Call CodeSandbox API from server (NO CORS issues)
    const response = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        files: sandboxFiles
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CodeSandbox API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    const sandboxId = data.sandbox_id;
    const embedUrl = `https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark&view=preview&hidedevtools=1`;
    const editUrl = `https://codesandbox.io/s/${sandboxId}`;

    return NextResponse.json({
      success: true,
      sandboxId,
      embedUrl,
      editUrl
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create sandbox'
    }, { status: 500 });
  }
}
