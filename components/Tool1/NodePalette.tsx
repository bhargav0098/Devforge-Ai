'use client';

import React from 'react';

interface NodeType {
  id: string;
  category: 'frontend' | 'backend' | 'database' | 'service';
  label: string;
  icon: string;
  description: string;
}

const nodes: NodeType[] = [
  // Frontend (4)
  { id: 'react', category: 'frontend', label: 'React', icon: '⚛️', description: 'Modern UI with hooks' },
  { id: 'nextjs', category: 'frontend', label: 'Next.js', icon: '▲', description: 'React with SSR/SSG' },
  { id: 'vue', category: 'frontend', label: 'Vue', icon: '🟢', description: 'Progressive framework' },
  { id: 'angular', category: 'frontend', label: 'Angular', icon: '🔴', description: 'Full-featured framework' },
  
  // Backend (4)
  { id: 'node-express', category: 'backend', label: 'Node.js + Express', icon: '🟢', description: 'Fast JavaScript API' },
  { id: 'python-fastapi', category: 'backend', label: 'Python + FastAPI', icon: '🐍', description: 'Modern Python API' },
  { id: 'go-gin', category: 'backend', label: 'Go + Gin', icon: '🔵', description: 'High-performance API' },
  { id: 'node-nestjs', category: 'backend', label: 'Node.js + NestJS', icon: '🔴', description: 'Enterprise TypeScript' },
  
  // Database (4)
  { id: 'postgresql', category: 'database', label: 'PostgreSQL', icon: '🐘', description: 'Relational database' },
  { id: 'mongodb', category: 'database', label: 'MongoDB', icon: '🍃', description: 'NoSQL database' },
  { id: 'redis', category: 'database', label: 'Redis', icon: '🔴', description: 'In-memory cache' },
  { id: 'mysql', category: 'database', label: 'MySQL', icon: '🐬', description: 'Popular relational DB' },
  
  // Services (3)
  { id: 'jwt-auth', category: 'service', label: 'JWT Auth', icon: '🔐', description: 'Token authentication' },
  { id: 'stripe', category: 'service', label: 'Stripe Payments', icon: '💳', description: 'Payment processing' },
  { id: 'aws-s3', category: 'service', label: 'AWS S3 Storage', icon: '☁️', description: 'File storage' }
];

export default function NodePalette() {
  const categories: Array<'frontend' | 'backend' | 'database' | 'service'> = ['frontend', 'backend', 'database', 'service'];
  
  const categoryLabels = {
    frontend: 'FRONTEND',
    backend: 'BACKEND',
    database: 'DATABASE',
    service: 'SERVICES'
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">📦 Components</h3>
        <p className="text-white/60 text-xs">Drag nodes to canvas</p>
      </div>
      
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-white/70 uppercase mb-3 tracking-wide">
            {categoryLabels[category]}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {nodes.filter(n => n.category === category).map(node => (
              <DraggableNode key={node.id} node={node} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DraggableNode({ node }: { node: NodeType }) {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      className="node-card text-center"
      title={node.description}
    >
      <div className="text-2xl mb-1">{node.icon}</div>
      <div className="text-xs text-white font-medium leading-tight">{node.label}</div>
    </div>
  );
}
