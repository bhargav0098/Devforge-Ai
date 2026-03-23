'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useProjectStore } from '@/store/projectStore';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 100;

export default function FileUploader() {
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const { setUploadedFiles, setIssues } = useProjectStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('');
    setProgress('');
    
    if (acceptedFiles.length > MAX_FILES) {
      setError(`Too many files (${acceptedFiles.length}). Maximum: ${MAX_FILES}`);
      return;
    }

    for (const file of acceptedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" is too large. Maximum: 10MB per file.`);
        return;
      }
    }

    const totalSize = acceptedFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setError(`Total size exceeds 50MB limit.`);
      return;
    }

    const codeFiles = acceptedFiles.filter(file =>
      /\.(js|jsx|ts|tsx|py|go|java|cpp|c|h|cs|rb|php|swift|kt|rs)$/.test(file.name)
    );

    if (codeFiles.length === 0) {
      setError('No code files found. Upload files with extensions: .js, .jsx, .ts, .tsx, .py, .go, etc.');
      return;
    }

    await analyzeFiles(codeFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { 'text/plain': ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java', '.cpp', '.c', '.h', '.cs', '.rb', '.php', '.swift', '.kt', '.rs'] }
  });

  const analyzeFiles = async (files: File[]) => {
    setLoading(true);
    setError('');
    setProgress('Uploading files...');

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      setProgress('Analyzing code with AI...');

      const response = await fetch('/api/review-code', { method: 'POST', body: formData });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze code');
      }

      const data = await response.json();
      setUploadedFiles(files.map(f => ({ name: f.name, size: f.size })));
      setIssues(data.issues || []);
      setProgress('');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const analyzeGitHub = async () => {
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Fetching repository from GitHub...');

    try {
      const response = await fetch('/api/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: githubUrl.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch repository');
      }

      setProgress('Analyzing code with AI...');
      const data = await response.json();
      setUploadedFiles(data.files?.map((f: any) => ({ name: f.path })) || []);
      setIssues(data.issues || []);
      setProgress('');
    } catch (err: any) {
      console.error('GitHub analysis error:', err);
      setError(err.message);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">📎 GitHub Repository</h3>
        <div className="flex gap-2">
          <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo" className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-white/40" disabled={loading} />
          <button onClick={analyzeGitHub} disabled={loading || !githubUrl.trim()} className="btn-primary">{loading ? '⏳' : '🔍'} Analyze</button>
        </div>
        <p className="text-white/60 text-sm mt-2">Public repositories only</p>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 glass-card text-white/60">OR</span></div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">📁 Upload Files</h3>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary-purple bg-primary-purple/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}>
          <input {...getInputProps()} disabled={loading} />
          <div className="text-white/60">
            {isDragActive ? <p className="text-xl">📂 Drop files here...</p> : (
              <>
                <p className="text-xl mb-2">📤 Drag & drop files or folders</p>
                <p className="text-sm">or click to browse</p>
                <p className="text-xs mt-4">Supports: .js, .jsx, .ts, .tsx, .py, .go, .java, etc.</p>
                <p className="text-xs mt-1">Max: 10MB per file • 50MB total • 100 files</p>
              </>
            )}
          </div>
        </div>
      </div>
      {progress && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-2xl">⚙️</div>
            <div className="flex-1">
              <p className="text-white font-semibold">{progress}</p>
              <div className="loading-shimmer h-2 rounded mt-2"></div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="glass-card p-4 border-2 border-red-500 bg-red-500/10">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
