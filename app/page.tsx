'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="circleGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(50)">
                  <stop offset="0%" stopColor="#1e2336"/>
                  <stop offset="100%" stopColor="#0b0d15"/>
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#circleGrad)"/>
              <circle cx="50" cy="50" r="49.5" stroke="white" strokeOpacity="0.1"/>
              <path d="M50 50 L20 50 L50 42 Z" fill="#818CF8" fillOpacity="0.4"/>
              <path d="M50 50 L20 50 L50 58 Z" fill="#6366F1" fillOpacity="0.6"/>
              <path d="M50 50 L80 50 L50 42 Z" fill="#818CF8" fillOpacity="0.4"/>
              <path d="M50 50 L80 50 L50 58 Z" fill="#6366F1" fillOpacity="0.6"/>
              <path d="M50 50 L50 85 L40 50 Z" fill="#4338CA"/>
              <path d="M50 50 L50 85 L60 50 Z" fill="#3730A3"/>
              <path d="M50 50 L50 15 L40 50 Z" fill="#E0E7FF"/>
              <path d="M50 50 L50 15 L60 50 Z" fill="#FFFFFF"/>
              <circle cx="50" cy="50" r="2" fill="white" filter="drop-shadow(0 0 5px white)"/>
            </svg>
          </div>
          <span className="text-white text-xl font-semibold">DevForge</span>
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/niranjanniru-max" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <Link 
            href="/architecture-builder"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-6xl font-bold text-white mb-4">
                DevForge <span className="text-indigo-400">AI</span>
              </h1>
              <p className="text-2xl text-white/90">AI-Powered Development Suite</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Link 
                href="/architecture-builder"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold text-lg flex items-center gap-3 shadow-lg shadow-indigo-500/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started
              </Link>
              <a 
                href="https://drive.google.com/file/d/19eKr1bieaEqaTmO7Q2GGPAS9iIO_TD3T/view"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-semibold text-lg flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </a>
            </div>
          </div>

          {/* Right Column - 3D Code Editor Card */}
          <div className="relative">
            <div className="code-editor-3d">
              <div className="editor-window">
                {/* Window Header */}
                <div className="window-header">
                  <div className="controls">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                  </div>
                  <div className="filename">&gt;_ refactor.js</div>
                  <div className="actions">
                    <span>↘</span> <span>↗</span> <span>✕</span>
                  </div>
                </div>

                {/* Code Content */}
                <div className="code-area">
                  <div className="ai-btn">▶ Run AI Refactor</div>
                  
                  <div className="code-line comment">// ❌ Messy Code</div>
                  <div className="code-line">
                    <span className="keyword">function</span> <span className="function">getData</span>() {'{'}
                  </div>
                  <div className="code-line indent-1">
                    <span className="keyword">var</span> <span className="variable">x</span> = <span className="function">fetch</span>(<span className="string">'https://api.example.com/data'</span>)
                  </div>
                  <div className="code-line indent-1">
                    <span className="variable">x</span>.<span className="function">then</span>(<span className="variable">res</span> =&gt; <span className="variable">res</span>.<span className="function">json</span>())
                  </div>
                  <div className="code-line indent-1">
                    .<span className="function">then</span>(<span className="variable">data</span> =&gt; {'{'}
                  </div>
                  <div className="code-line indent-2">
                    <span className="variable">console</span>.<span className="function">log</span>(<span className="variable">data</span>)
                  </div>
                  <div className="code-line indent-2">
                    <span className="variable">document</span>.<span className="function">getElementById</span>(<span className="string">'app'</span>).<span className="variable">innerHTML</span> =
                  </div>
                  <div className="code-line indent-3">
                    <span className="string">'&lt;h1&gt;'</span> + <span className="variable">data</span>.<span className="variable">title</span> + <span className="string">'&lt;/h1&gt;'</span>
                  </div>
                  <div className="code-line indent-1">{'}'})</div>
                  <div className="code-line">{'}'}</div>
                </div>

                {/* Floating Toast */}
                <div className="toast-3d">
                  <div className="refresh-icon">↺</div>
                  <div className="toast-text">
                    <div className="toast-label">Optimization</div>
                    <div className="toast-value">+450ms faster</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Tool Cards Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Architecture Builder */}
          <Link href="/architecture-builder">
            <div className="tool-card group">
              <div className="tool-icon-wrapper">
                <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="tool-title">Architecture Builder</h3>
              <p className="tool-description">
                Design full-stack apps visually with drag-and-drop. Generate production code in seconds.
              </p>
              <div className="tool-cta">
                Launch Tool
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card 2: AI Code Reviewer */}
          <Link href="/code-reviewer">
            <div className="tool-card group">
              <div className="tool-icon-wrapper">
                <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="tool-title">AI Code Reviewer</h3>
              <p className="tool-description">
                Analyze your codebase for security vulnerabilities, performance issues, and code quality.
              </p>
              <div className="tool-cta">
                Launch Tool
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card 3: Documentation Generator */}
          <Link href="/docs-generator">
            <div className="tool-card group">
              <div className="tool-icon-wrapper">
                <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="tool-title">Documentation Generator</h3>
              <p className="tool-description">
                Auto-generate comprehensive README, API docs, and deployment guides from your codebase.
              </p>
              <div className="tool-cta">
                Launch Tool
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
