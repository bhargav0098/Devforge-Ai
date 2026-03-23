'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import FileUploader from '@/components/Tool2/FileUploader';
import IssuesList from '@/components/Tool2/IssuesList';

export default function CodeReviewerPage() {
  const { issues } = useProjectStore();

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="glass-card p-4">
        <h1 className="text-2xl font-bold text-white mb-1"> AI Code Reviewer</h1>
        <p className="text-white/60 text-sm">Analyze your codebase for security vulnerabilities, performance issues, and code quality</p>
      </div>
      {issues && issues.length > 0 ? <IssuesList /> : <FileUploader />}
    </div>
  );
}
