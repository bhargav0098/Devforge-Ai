'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Issue {
  id: string;
  severity: 'critical' | 'medium' | 'low';
  category: string;
  title: string;
  file: string;
  line: number;
  code_snippet: string;
  problem: string;
  impact: string;
  fix: string;
  explanation: string;
}

export default function IssueCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyFix = async () => {
    await navigator.clipboard.writeText(issue.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityConfig = {
    critical: { border: 'border-red-500', bg: 'bg-red-500/10', icon: '🔴', color: 'text-red-400' },
    medium: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', icon: '🟡', color: 'text-yellow-400' },
    low: { border: 'border-green-500', bg: 'bg-green-500/10', icon: '🟢', color: 'text-green-400' }
  };

  const config = severityConfig[issue.severity];

  return (
    <div className={`glass-card border-2 ${config.border} ${config.bg}`}>
      <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <h5 className="text-white font-semibold text-lg">{issue.title}</h5>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span>📍 {issue.file}:{issue.line}</span>
              <span>•</span>
              <span className="capitalize">{issue.category}</span>
            </div>
          </div>
          <div className="text-2xl text-white/60 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div>
            <h6 className="text-white font-semibold mb-2 flex items-center gap-2">⚠️ Problem</h6>
            <p className="text-white/80 text-sm">{issue.problem}</p>
          </div>
          <div>
            <h6 className="text-white font-semibold mb-2 flex items-center gap-2">📝 Current Code</h6>
            <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
              {issue.code_snippet}
            </SyntaxHighlighter>
          </div>
          <div>
            <h6 className="text-white font-semibold mb-2 flex items-center gap-2">💥 Impact</h6>
            <p className="text-white/80 text-sm">{issue.impact}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h6 className="text-white font-semibold flex items-center gap-2">✅ Recommended Fix</h6>
              <button onClick={copyFix} className="text-sm text-white/60 hover:text-white transition-colors">{copied ? '✓ Copied!' : '📋 Copy Fix'}</button>
            </div>
            <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ background: 'rgba(0,255,0,0.1)', borderRadius: '8px', padding: '12px', fontSize: '12px', border: '1px solid rgba(0,255,0,0.2)' }}>
              {issue.fix}
            </SyntaxHighlighter>
          </div>
          <div>
            <h6 className="text-white font-semibold mb-2 flex items-center gap-2">💡 Explanation</h6>
            <p className="text-white/80 text-sm">{issue.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
