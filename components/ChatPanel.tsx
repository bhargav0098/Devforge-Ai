'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { usePathname } from 'next/navigation';
import ChatMessage from './ChatMessage';

export default function ChatPanel() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(18); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toolName = pathname.includes('architecture-builder') ? 'architecture-builder' :
                   pathname.includes('code-reviewer') ? 'code-reviewer' :
                   pathname.includes('docs-generator') ? 'docs-generator' : '';

  const { chatHistory, addChatMessage } = useProjectStore();
  const messages = chatHistory[toolName] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resizing logic
  const handleMouseDown = () => setIsResizing(true);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      if (newWidth >= 15 && newWidth <= 40) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    
    addChatMessage(toolName, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    setLoading(true);

    try {
      const context = getToolContext(toolName);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          toolContext: context,
          chatHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Handle function calls
      if (data.functionCalls?.length > 0) {
        data.functionCalls.forEach((call: any) => executeFunctionCall(call));
      }

      addChatMessage(toolName, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      addChatMessage(toolName, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const getToolContext = (tool: string) => {
    const store = useProjectStore.getState();
    
    switch (tool) {
      case 'architecture-builder':
        return {
          tool: 'architecture-builder',
          nodes: store.nodes,
          edges: store.edges,
          customizations: store.customizations
        };
      case 'code-reviewer':
        return {
          tool: 'code-reviewer',
          uploadedFiles: store.uploadedFiles,
          issues: store.issues
        };
      case 'docs-generator':
        return {
          tool: 'docs-generator',
          uploadedFiles: store.uploadedFiles
        };
      default:
        return { tool: 'unknown' };
    }
  };

  const executeFunctionCall = (call: any) => {
    const store = useProjectStore.getState();
    
    if (call.name === 'add_node') {
      const newNode = {
        id: `${call.args.label}-${Date.now()}`,
        type: 'custom',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        data: {
          label: call.args.label,
          category: call.args.category,
          icon: getNodeIcon(call.args.label),
          nodeId: call.args.label.toLowerCase().replace(/\s+/g, '-')
        }
      };
      store.setNodes([...store.nodes, newNode]);
    } else if (call.name === 'remove_node') {
      const filtered = store.nodes.filter(n => n.data.label !== call.args.label);
      store.setNodes(filtered);
    } else if (call.name === 'update_customization') {
      store.updateCustomizations(call.args);
    }
  };

  const getNodeIcon = (label: string): string => {
    const icons: Record<string, string> = {
      'React': '⚛️', 'Next.js': '▲', 'Vue': '🟢', 'Angular': '🔴',
      'Node.js + Express': '🟢', 'Python + FastAPI': '🐍', 'Go + Gin': '🔵', 'Node.js + NestJS': '🔴',
      'PostgreSQL': '🐘', 'MongoDB': '🍃', 'Redis': '🔴', 'MySQL': '🐬',
      'JWT Auth': '🔐', 'Stripe Payments': '💳', 'AWS S3 Storage': '☁️'
    };
    return icons[label] || '📦';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 glass-card p-3 rounded-l-lg hover:bg-white/20 transition-colors z-10"
        style={{ writingMode: 'vertical-rl' }}
      >
        💬 Chat
      </button>
    );
  }

  return (
    <>
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary-purple transition-colors z-20"
        style={{ background: isResizing ? '#667eea' : 'transparent' }}
      />
      
      <div className="h-full flex flex-col glass-card m-2" style={{ width: `${width}%` }}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold flex items-center gap-2 truncate">
              💬 AI Assistant
            </h3>
            <p className="text-white/60 text-xs mt-1 truncate">Context-aware help</p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-white/60 hover:text-white transition-colors ml-2 flex-shrink-0"
            title="Collapse chat"
          >
            →
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 mt-8">
              <p className="text-2xl mb-2">👋</p>
              <p className="font-semibold">Hey there!</p>
              <p className="text-sm mt-2">I'm your DevForge AI assistant.</p>
              <p className="text-xs mt-4">
                {toolName === 'architecture-builder' && 'Ask me to add nodes, explain architecture, or suggest improvements!'}
                {toolName === 'code-reviewer' && 'Ask me about security issues, best practices, or alternative solutions!'}
                {toolName === 'docs-generator' && 'Ask me to improve docs, add sections, or simplify explanations!'}
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          
          {loading && (
            <div className="chat-message-assistant">
              <div className="loading-shimmer h-4 rounded mb-2"></div>
              <div className="loading-shimmer h-4 rounded w-3/4"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-white/40 resize-none"
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="btn-primary px-4"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2">Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
