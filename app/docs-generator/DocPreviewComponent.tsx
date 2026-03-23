'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';

interface DocPreviewProps {
  docs: any;
}

export default function DocPreviewComponent({ docs }: DocPreviewProps) {
  const downloadDoc = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Generated Documentation</h2>
          </div>
        </div>
      </div>

      {docs.readme && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">README.md</h3>
            <button
              onClick={() => downloadDoc(docs.readme, 'README.md')}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="bg-white/5 rounded-lg p-6 max-h-[600px] overflow-auto">
            <div className="text-white text-sm whitespace-pre-wrap font-mono">{docs.readme}</div>
          </div>
        </div>
      )}

      {docs.apiDocs && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">API Documentation</h3>
            <button
              onClick={() => downloadDoc(docs.apiDocs, 'API.md')}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="bg-white/5 rounded-lg p-6 max-h-[600px] overflow-auto">
            <div className="text-white text-sm whitespace-pre-wrap font-mono">{docs.apiDocs}</div>
          </div>
        </div>
      )}

      {docs.deployment && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Deployment Guide</h3>
            <button
              onClick={() => downloadDoc(docs.deployment, 'DEPLOYMENT.md')}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="bg-white/5 rounded-lg p-6 max-h-[600px] overflow-auto">
            <div className="text-white text-sm whitespace-pre-wrap font-mono">{docs.deployment}</div>
          </div>
        </div>
      )}

      {docs.contributing && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Contributing Guidelines</h3>
            <button
              onClick={() => downloadDoc(docs.contributing, 'CONTRIBUTING.md')}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="bg-white/5 rounded-lg p-6 max-h-[600px] overflow-auto">
            <div className="text-white text-sm whitespace-pre-wrap font-mono">{docs.contributing}</div>
          </div>
        </div>
      )}
    </div>
  );
}
