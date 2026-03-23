'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import PreviewModal from './PreviewModal';

interface GeneratedFile {
  path: string;
  content: string;
}

interface Props {
  files: GeneratedFile[];
  setupInstructions: string;
}

export default function GeneratedCodeView({ files, setupInstructions }: Props) {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(files[0] || null);
  const [showPreview, setShowPreview] = useState(false);
  const [copying, setCopying] = useState(false);

  const downloadZip = async () => {
    const zip = new JSZip();
    files.forEach(file => zip.file(file.path, file.content));
    zip.file('SETUP.md', `# Setup Instructions\n\n${setupInstructions}`);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'devforge-generated-project.zip');
  };

  const copyToClipboard = async (content: string) => {
    setCopying(true);
    await navigator.clipboard.writeText(content);
    setTimeout(() => setCopying(false), 2000);
  };

  const getLanguage = (path: string): string => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.go')) return 'go';
    if (path.endsWith('.sql')) return 'sql';
    if (path.endsWith('.md')) return 'markdown';
    return 'text';
  };

  const buildFileTree = () => {
    const tree: any = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) {
          if (!current._files) current._files = [];
          current._files.push(file);
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      });
    });
    return tree;
  };

  const renderFileTree = (tree: any, path: string = ''): any => {
    return Object.keys(tree).map(key => {
      if (key === '_files') {
        return tree[key].map((file: GeneratedFile, idx: number) => (
          <button key={idx} onClick={() => setSelectedFile(file)} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedFile?.path === file.path ? 'bg-white/20 text-white font-semibold' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            📄 {file.path.split('/').pop()}
          </button>
        ));
      }
      return (
        <details key={key} open className="ml-2">
          <summary className="cursor-pointer text-white/80 hover:text-white py-1 text-sm font-medium">📁 {key}</summary>
          <div className="ml-2 border-l border-white/10 pl-2">{renderFileTree(tree[key], `${path}${key}/`)}</div>
        </details>
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">✅ Code Generated Successfully!</h3>
            <p className="text-white/60 text-sm">{files.length} files created</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPreview(true)} className="btn-secondary flex items-center gap-2">👁️ Preview</button>
            <button onClick={downloadZip} className="btn-primary flex items-center gap-2">📥 Download ZIP</button>
          </div>
        </div>
      </div>
      <div className="glass-card flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-white/10 overflow-y-auto p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">📂 Project Structure</h4>
          <div className="space-y-1">{renderFileTree(buildFileTree())}</div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {selectedFile ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                <h4 className="text-white font-mono text-sm">{selectedFile.path}</h4>
                <button onClick={() => copyToClipboard(selectedFile.content)} className="text-white/60 hover:text-white text-sm transition-colors">
                  {copying ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <SyntaxHighlighter language={getLanguage(selectedFile.path)} style={vscDarkPlus} customStyle={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', fontSize: '13px' }} showLineNumbers>
                {selectedFile.content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">Select a file to view code</div>
          )}
        </div>
      </div>
      {showPreview && <PreviewModal files={files} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
