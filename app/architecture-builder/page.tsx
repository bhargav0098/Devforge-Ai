'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import NodePalette from '@/components/Tool1/NodePalette';
import ArchitectureCanvas from '@/components/Tool1/ArchitectureCanvas';
import ValidationIndicator from '@/components/Tool1/ValidationIndicator';
import GeneratedCodeView from '@/components/Tool1/GeneratedCodeView';

export default function ArchitectureBuilderPage() {
  const { nodes, customizations, currentProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const frontend = nodes.filter(n => n.data?.category === 'frontend');
    const backend = nodes.filter(n => n.data?.category === 'backend');
    const database = nodes.filter(n => n.data?.category === 'database');

    if (frontend.length !== 1 || backend.length !== 1 || database.length === 0) {
      setError('Invalid architecture. Need 1 frontend + 1 backend + 1+ database');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, customizations })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }

      const data = await response.json();
      useProjectStore.getState().saveGeneratedCode(data.data.files, data.data.setup_instructions, data.data.dependencies);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="glass-card p-4">
        <h1 className="text-2xl font-bold text-white mb-1"> Architecture Builder</h1>
        <p className="text-white/60 text-sm">Drag nodes to canvas, then generate production code</p>
      </div>
      {currentProject ? (
        <div className="flex-1 overflow-hidden">
          <GeneratedCodeView files={currentProject.files} setupInstructions={currentProject.setupInstructions || ''} />
        </div>
      ) : (
        <>
          <ValidationIndicator />
          <div className="flex-1 grid grid-cols-[250px_1fr] gap-4 overflow-hidden">
            <div className="glass-card overflow-hidden"><NodePalette /></div>
            <div className="glass-card overflow-hidden"><ArchitectureCanvas /></div>
          </div>
          <div className="glass-card p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400">❌ {error}</p>
              </div>
            )}
            <button onClick={handleGenerate} disabled={loading || nodes.length < 3} className="btn-primary w-full text-lg py-4">
              {loading ? <><div className="inline-block animate-spin mr-2">⚙️</div>Generating Code... (30-60 seconds)</> : ' Generate Full Stack Code'}
            </button>
            {loading && (
              <div className="mt-4">
                <div className="loading-shimmer h-2 rounded"></div>
                <p className="text-white/60 text-sm text-center mt-2">AI is generating your complete project...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
