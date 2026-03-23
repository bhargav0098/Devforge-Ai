'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
  data: {
    label: string;
    icon: string;
    category: string;
    nodeId: string;
  };
}

export default function CustomNode({ data }: CustomNodeProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend':
        return 'border-blue-400';
      case 'backend':
        return 'border-green-400';
      case 'database':
        return 'border-purple-400';
      case 'service':
        return 'border-pink-400';
      default:
        return 'border-white/20';
    }
  };

  return (
    <div className={`node-card min-w-[150px] border-2 ${getCategoryColor(data.category)}`}>
      <Handle 
        type="target" 
        position={Position.Top}
        className="w-3 h-3 !bg-primary-purple border-2 border-white"
      />
      
      <div className="text-center">
        <div className="text-3xl mb-2">{data.icon}</div>
        <div className="text-white font-semibold text-sm">{data.label}</div>
        <div className="text-white/60 text-xs mt-1 capitalize">{data.category}</div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary-pink border-2 border-white"
      />
    </div>
  );
}
