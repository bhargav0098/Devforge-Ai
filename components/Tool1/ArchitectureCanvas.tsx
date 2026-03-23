'use client';

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjectStore } from '@/store/projectStore';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode
};

function CanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setNodes: setStoreNodes, setEdges: setStoreEdges } = useProjectStore();

  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    setNodes((nds) => nds.filter((n) => !deleted.find((d) => d.id === n.id)));
  }, [setNodes]);

  // Auto-connect logic - FIXED VERSION
  const autoConnectNodes = useCallback((allNodes: Node[]) => {
    if (allNodes.length < 2) {
      setEdges([]);
      return;
    }

    // Sort ALL nodes by Y position (top to bottom)
    const sortedNodes = [...allNodes].sort((a, b) => a.position.y - b.position.y);
    
    const newEdges: Edge[] = [];
    
    // SIMPLE APPROACH: Connect each node to the next one in vertical order
    // This ensures ALL 4 nodes connect: React → Node.js → PostgreSQL → Stripe
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const sourceNode = sortedNodes[i];
      const targetNode = sortedNodes[i + 1];
      
      newEdges.push({
        id: `${sourceNode.id}-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: 'url(#edge-gradient)',
          strokeWidth: 3
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#667eea'
        }
      });
    }
    
    console.log(`Auto-connected ${newEdges.length} edges for ${sortedNodes.length} nodes`);
    setEdges(newEdges);
  }, [setEdges]);

  const isValidConnection = (source: string, target: string): boolean => {
    if (source === 'frontend' && target === 'backend') return true;
    if (source === 'backend' && target === 'database') return true;
    if (source === 'backend' && target === 'service') return true;
    if (source === 'database' && target === 'database') return true;
    if (source === 'service' && target === 'service') return true;
    return false;
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const nodeDataString = event.dataTransfer.getData('application/reactflow');
    if (!nodeDataString) return;

    const nodeData = JSON.parse(nodeDataString);
    const position = {
      x: event.clientX - reactFlowBounds.left - 75 + (Math.random() * 20 - 10),
      y: event.clientY - reactFlowBounds.top - 40 + (Math.random() * 20 - 10),
    };

    const newNode: Node = {
      id: `${nodeData.id}-${Date.now()}`,
      type: 'custom',
      position,
      data: { label: nodeData.label, icon: nodeData.icon, category: nodeData.category, nodeId: nodeData.id },
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      setTimeout(() => autoConnectNodes(updatedNodes), 100);
      return updatedNodes;
    });
  }, [setNodes, autoConnectNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodesDelete={onNodesDelete} onDrop={onDrop} onDragOver={onDragOver} nodeTypes={nodeTypes} nodesDraggable={true} nodesConnectable={false} elementsSelectable={true} fitView minZoom={0.5} maxZoom={1.5}>
        <Background color="#ffffff20" gap={16} />
        <Controls />
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#f093fb" />
            </linearGradient>
          </defs>
        </svg>
      </ReactFlow>
    </div>
  );
}

export default function ArchitectureCanvas() {
  return <ReactFlowProvider><CanvasInner /></ReactFlowProvider>;
}
