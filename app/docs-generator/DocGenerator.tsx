'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import DocPreview from './DocPreviewComponent';
import { useProjectStore } from '@/store/projectStore';
import { Upload, FileText, Settings, Sparkles } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 100;

export default function DocGenerator() {
  const [githubUrl, setGithubUrl] = useState('');
  const [docTypes, setDocTypes] = useState({
    readme: true,
    apiDocs: true,
    deployment: true,
    contributing: false
  });
  const [style, setStyle] = useState<'beginner' | 'technical' | 'enterprise'>('technical');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFilesList, setUploadedFilesList] = useState<File[]>([]);
  
  const { generatedDocs, setGeneratedDocs, setUploadedFiles } = useProjectStore();

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);
    
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
      /\.(js|jsx|ts|tsx|py|go|java|cpp|c|h|cs|rb|php)$/.test(file.name)
    );

    if (codeFiles.length === 0) {
      setError('No code files found.');
      return;
    }

    setUploadedFilesList(codeFiles);
    setUploadedFiles(codeFiles.map(f => ({ name: f.name, size: f.size })));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const generateDocs = async () => {
    // ... existing generateDocs logic ...
    const filesToUse = uploadedFilesList.length > 0 
      ? uploadedFilesList.map(f => ({ name: f.name, size: f.size }))
      : [];

    if (filesToUse.length === 0 && !githubUrl.trim()) {
      setError('Please upload files or provide a GitHub URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedTypes = Object.entries(docTypes)
        .filter(([_, selected]) => selected)
        .map(([type]) => type);

      if (selectedTypes.length === 0) {
        setError('Please select at least one documentation type');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToUse,
          githubUrl: githubUrl.trim() || undefined,
          docTypes: selectedTypes,
          style
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate documentation');
      }

      const data = await response.json();
      setGeneratedDocs(data.docs);

    } catch (err: any) {
      console.error('Documentation generation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {generatedDocs && Object.keys(generatedDocs).length > 0 ? (
        <div key="preview-container" className="animate-in fade-in duration-500">
          <DocPreview docs={generatedDocs} />
          <button 
            onClick={() => setGeneratedDocs(null)}
            className="mt-6 text-white/50 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            ← Generate New Documentation
          </button>
        </div>
      ) : (
        <div key="form-container" className="space-y-6 animate-in fade-in duration-500">
          {/* GitHub URL */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">GitHub Repository</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white placeholder-white/40 border border-cyan-500/20 focus:outline-none focus:border-cyan-500/40"
                disabled={loading}
              />
            </div>
            <p className="text-white/60 text-sm mt-2">Public repositories only</p>
          </div>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass-card text-white/60">OR</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Upload Files</h3>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5'
              }`}
            >
              <input {...getInputProps()} disabled={loading} />
              <Upload className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
              <div className="text-white/60">
                {isDragActive ? (
                  <p className="text-xl">Drop files here...</p>
                ) : (
                  <>
                    <p className="text-xl mb-2">Drag & drop files or folders</p>
                    <p className="text-sm">or click to browse</p>
                    <p className="text-xs mt-4">Supports: .js, .ts, .py, .go, .java, etc.</p>
                    <p className="text-xs">Max: 10MB per file • 50MB total • 100 files</p>
                  </>
                )}
              </div>
            </div>
            {uploadedFilesList.length > 0 && (
              <p className="text-cyan-400 text-sm mt-3">{uploadedFilesList.length} files uploaded</p>
            )}
          </div>

          {/* Doc Types */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Documentation to Generate</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="checkbox"
                  checked={docTypes.readme}
                  onChange={(e) => setDocTypes({ ...docTypes, readme: e.target.checked })}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span>README.md (Setup & Usage)</span>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="checkbox"
                  checked={docTypes.apiDocs}
                  onChange={(e) => setDocTypes({ ...docTypes, apiDocs: e.target.checked })}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span>API Documentation</span>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="checkbox"
                  checked={docTypes.deployment}
                  onChange={(e) => setDocTypes({ ...docTypes, deployment: e.target.checked })}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span>Deployment Guide</span>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="checkbox"
                  checked={docTypes.contributing}
                  onChange={(e) => setDocTypes({ ...docTypes, contributing: e.target.checked })}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span>Contributing Guidelines</span>
              </label>
            </div>
          </div>

          {/* Style Selection */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Documentation Style</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="radio"
                  checked={style === 'beginner'}
                  onChange={() => setStyle('beginner')}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <div>
                  <span className="font-medium">Beginner-friendly</span>
                  <p className="text-white/60 text-sm">Simple language, step-by-step</p>
                </div>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="radio"
                  checked={style === 'technical'}
                  onChange={() => setStyle('technical')}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <div>
                  <span className="font-medium">Technical</span>
                  <p className="text-white/60 text-sm">Developer-focused, concise</p>
                </div>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400">
                <input
                  type="radio"
                  checked={style === 'enterprise'}
                  onChange={() => setStyle('enterprise')}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <div>
                  <span className="font-medium">Enterprise</span>
                  <p className="text-white/60 text-sm">Formal, comprehensive</p>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-card p-4 border-2 border-red-500 bg-red-500/10">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateDocs}
            disabled={loading}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin">⚙️</div>
                Generating Documentation...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Documentation
              </>
            )}
          </button>

          {loading && (
            <div className="glass-card p-4">
              <div className="loading-shimmer h-2 rounded mb-2"></div>
              <p className="text-white/60 text-sm text-center">AI is analyzing your code...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
