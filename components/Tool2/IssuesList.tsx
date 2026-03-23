'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import IssueCard from './IssueCard';

export default function IssuesList() {
  const { issues } = useProjectStore();

  if (!issues || issues.length === 0) return null;

  const critical = issues.filter(i => i.severity === 'critical');
  const medium = issues.filter(i => i.severity === 'medium');
  const low = issues.filter(i => i.severity === 'low');

  const downloadReport = () => {
    let report = '# Code Review Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `## Summary\n- Critical: ${critical.length}\n- Medium: ${medium.length}\n- Low: ${low.length}\n- Total: ${issues.length}\n\n`;
    
    const addIssues = (severity: string, issueList: any[]) => {
      if (issueList.length === 0) return;
      report += `## ${severity.toUpperCase()} Issues\n\n`;
      issueList.forEach((issue, idx) => {
        report += `### ${idx + 1}. ${issue.title}\n**File:** ${issue.file}:${issue.line}\n**Category:** ${issue.category}\n\n**Problem:**\n${issue.problem}\n\n**Impact:**\n${issue.impact}\n\n**Fix:**\n\`\`\`\n${issue.fix}\n\`\`\`\n\n**Explanation:**\n${issue.explanation}\n\n---\n\n`;
      });
    };
    
    addIssues('Critical', critical);
    addIssues('Medium', medium);
    addIssues('Low', low);
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">📊 Analysis Complete</h3>
          <button onClick={downloadReport} className="btn-secondary text-sm">📥 Download Report</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 glass-card">
            <div className="text-4xl font-bold text-red-400">{critical.length}</div>
            <div className="text-white/60 text-sm mt-1">Critical</div>
          </div>
          <div className="text-center p-4 glass-card">
            <div className="text-4xl font-bold text-yellow-400">{medium.length}</div>
            <div className="text-white/60 text-sm mt-1">Medium</div>
          </div>
          <div className="text-center p-4 glass-card">
            <div className="text-4xl font-bold text-green-400">{low.length}</div>
            <div className="text-white/60 text-sm mt-1">Low</div>
          </div>
        </div>
      </div>
      {critical.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">🔴 Critical Issues ({critical.length})</h4>
          <div className="space-y-3">{critical.map(issue => <IssueCard key={issue.id} issue={issue} />)}</div>
        </div>
      )}
      {medium.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">🟡 Medium Priority Issues ({medium.length})</h4>
          <div className="space-y-3">{medium.map(issue => <IssueCard key={issue.id} issue={issue} />)}</div>
        </div>
      )}
      {low.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">🟢 Low Priority Issues ({low.length})</h4>
          <div className="space-y-3">{low.map(issue => <IssueCard key={issue.id} issue={issue} />)}</div>
        </div>
      )}
    </div>
  );
}
