'use client';

import React from 'react';
import { X, Download } from 'lucide-react';
import { Sandpack } from '@codesandbox/sandpack-react';

interface Props {
  files: Array<{ path: string; content: string }>;
  onClose: () => void;
  onDownload: () => void;
}

export default function PreviewModal({ files, onClose, onDownload }: Props) {
  // Convert files to Sandpack format
  const sandpackFiles: Record<string, string> = {};
  
  files
    .filter(f => f.path.startsWith('frontend/'))
    .forEach(file => {
      // Remove "frontend/" prefix and use "/" for root
      const cleanPath = file.path.replace('frontend/', '/');
      sandpackFiles[cleanPath] = file.content;
    });

  console.log('[Preview] Sandpack files:', Object.keys(sandpackFiles));

  // Default fallback if app is missing
  if (!sandpackFiles['/src/App.tsx'] && !sandpackFiles['/src/App.jsx']) {
    sandpackFiles['/src/App.tsx'] = `export default function App() {
    return <div style={{padding: '40px', textAlign: 'center'}}>
      <h1>Preview Ready</h1>
      <p>Generated app will appear here</p>
    </div>
  }`;
  }

  // Inject backend mock to prevent "Failed to fetch"
  sandpackFiles['/src/mock-backend.js'] = `
/**
 * Mocking backend for Sandpack live preview
 */
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const url = args[0]?.toString() || '';
  // Intercept relative API calls or anything containing /api
  if (url.includes('/api') || (!url.startsWith('http') && !url.startsWith('blob:'))) {
    console.log('[Preview Mock] Intercepted fetch to:', url);
    return new Response(JSON.stringify({ 
      message: "⚠️ Preview shows frontend only. Download ZIP to run full-stack locally.",
      status: "success",
      data: { message: "⚠️ Preview shows frontend only. Download ZIP to run full-stack locally." }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return originalFetch(...args);
};
`;

  // Inject mock into entry point
  const entryPath = Object.keys(sandpackFiles).find(p => 
    p.endsWith('main.tsx') || p.endsWith('index.tsx') || p.endsWith('index.js') || p.endsWith('main.js')
  );
  if (entryPath) {
    sandpackFiles[entryPath] = "import './mock-backend';\n" + sandpackFiles[entryPath];
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🖥️ Live Preview
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Interactive preview powered by Sandpack
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download ZIP
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-yellow-500/20 p-2 text-center text-sm">
          ⚠️ Preview shows frontend only. Download ZIP to run full-stack locally.
        </div>

        {/* Sandpack Preview */}
        <div className="flex-1 overflow-hidden">
          <Sandpack
            template="react-ts"
            files={sandpackFiles}
            theme="dark"
            options={{
              showNavigator: false,
              showTabs: true,
              showLineNumbers: true,
              editorHeight: '100%',
              editorWidthPercentage: 50,
              autorun: true,
              autoReload: true
            }}
            customSetup={{
              dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
              },
              environment: 'create-react-app'
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-white/5 flex-shrink-0">
          <p className="text-white/60 text-xs text-center">
            💡 Tip: Edit code on the left to see live changes on the right
          </p>
        </div>
      </div>
    </div>
  );
}
