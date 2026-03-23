'use client';

import React from 'react';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}>
      <div className="flex items-start gap-2">
        <div className="text-xl flex-shrink-0">
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p className="text-white/40 text-xs mt-2">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}
