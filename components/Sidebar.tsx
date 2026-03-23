'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Layers, Search, FileText, Home, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const tools = [
    { 
      name: 'Architecture Builder', 
      icon: Layers, 
      path: '/architecture-builder',
      description: 'Build & Generate',
      color: 'text-cyan-400'
    },
    { 
      name: 'Code Reviewer', 
      icon: Search, 
      path: '/code-reviewer',
      description: 'Analyze Code',
      color: 'text-purple-400'
    },
    { 
      name: 'Docs Generator', 
      icon: FileText, 
      path: '/docs-generator',
      description: 'Create Docs',
      color: 'text-pink-400'
    },
  ];

  if (collapsed) {
    return (
      <div className="h-full flex flex-col glass-card m-2 p-2 items-center" style={{ width: '70px' }}>
        <button
          onClick={() => setCollapsed(false)}
          className="text-white/60 hover:text-white mb-6 p-2 hover:bg-white/10 rounded-lg transition-all"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <nav className="flex-1 space-y-3 w-full">
          {tools.map((tool) => {
            const isActive = pathname === tool.path;
            const Icon = tool.icon;
            return (
              <Link key={tool.path} href={tool.path}>
                <div
                  className={`p-3 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center ${
                    isActive ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
                  }`}
                  title={tool.name}
                >
                  <Icon className={`w-6 h-6 ${tool.color}`} />
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-white/40 text-[10px]">Gemini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass-card m-2 p-4 relative" style={{ width: '240px' }}>
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(true)}
        className="absolute top-3 right-3 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Collapse sidebar"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Logo */}
      <Link href="/">
        <div className="mb-8 pb-4 border-b border-white/10 cursor-pointer hover:opacity-80 transition-opacity group">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              DevForge AI
            </h1>
          </div>
          <p className="text-xs text-white/60 ml-8">AI Development Suite</p>
        </div>
      </Link>

      {/* Tools Navigation */}
      <nav className="flex-1 space-y-2">
        {tools.map((tool) => {
          const isActive = pathname === tool.path;
          const Icon = tool.icon;
          
          return (
            <Link key={tool.path} href={tool.path}>
              <div className={`sidebar-item ${isActive ? 'active' : ''} p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                isActive ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${tool.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">
                      {tool.name}
                    </div>
                    <div className="text-white/60 text-xs truncate">
                      {tool.description}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 text-center">
        <p className="text-white/40 text-xs">Powered by Gemini API</p>
      </div>
    </div>
  );
}
