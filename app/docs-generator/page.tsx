'use client';

import React from 'react';
import DocGenerator from './DocGenerator';

export default function DocsGeneratorPage() {
  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="glass-card p-4">
        <h1 className="text-2xl font-bold text-white mb-1"> Documentation Generator</h1>
        <p className="text-white/60 text-sm">Auto-generate comprehensive README, API docs, and deployment guides</p>
      </div>

      <DocGenerator />
    </div>
  );
}
