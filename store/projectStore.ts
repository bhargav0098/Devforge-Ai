import { create } from 'zustand';

interface NodeData {
  label: string;
  icon: string;
  category: string;
  nodeId: string;
}

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
  markerEnd?: Record<string, unknown>;
}

interface Customizations {
  projectName?: string;
  description?: string;
  features?: string[];
  design?: {
    theme?: string;
    colors?: string[];
    buttonStyle?: string;
    layout?: string;
    typography?: string;
    spacing?: string;
  };
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface CurrentProject {
  id: number;
  type: string;
  files: GeneratedFile[];
  timestamp: number;
  setupInstructions?: string;
  dependencies?: any;
}

interface Issue {
  id: string;
  severity: 'critical' | 'medium' | 'low';
  category: string;
  title: string;
  file: string;
  line: number;
  code_snippet: string;
  problem: string;
  impact: string;
  fix: string;
  explanation: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectStore {
  // Tool 1 - Architecture Builder
  nodes: Node[];
  edges: Edge[];
  customizations: Customizations;
  currentProject: CurrentProject | null;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setCustomizations: (customizations: Customizations) => void;
  updateCustomizations: (updates: Partial<Customizations>) => void;
  saveGeneratedCode: (files: GeneratedFile[], setupInstructions: string, dependencies: any) => void;
  
  // Tool 2 - Code Reviewer
  uploadedFiles: Array<{ name: string; size?: number; path?: string }>;
  issues: Issue[];
  
  setUploadedFiles: (files: Array<{ name: string; size?: number; path?: string }>) => void;
  setIssues: (issues: Issue[]) => void;
  
  // Tool 3 - Docs Generator
  generatedDocs: any;
  
  setGeneratedDocs: (docs: any) => void;
  
  // Chat
  chatHistory: Record<string, ChatMessage[]>;
  
  addChatMessage: (tool: string, message: ChatMessage) => void;
  clearChatHistory: (tool: string) => void;
  
  // Global
  clearAll: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  customizations: {},
  currentProject: null,
  uploadedFiles: [],
  issues: [],
  generatedDocs: {},
  chatHistory: {},

  // Tool 1 methods
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  setCustomizations: (customizations) => set({ customizations }),
  
  updateCustomizations: (updates) => set((state) => ({
    customizations: {
      ...state.customizations,
      ...updates,
      design: {
        ...state.customizations.design,
        ...updates.design
      }
    }
  })),
  
  saveGeneratedCode: (files, setupInstructions, dependencies) => set({ 
    currentProject: {
      id: Date.now(),
      type: 'generated',
      files,
      timestamp: Date.now(),
      setupInstructions,
      dependencies
    }
  }),

  // Tool 2 methods
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  
  setIssues: (issues) => set({ issues }),

  // Tool 3 methods
  setGeneratedDocs: (docs) => set({ generatedDocs: docs }),

  // Chat methods
  addChatMessage: (tool, message) => set((state) => ({
    chatHistory: {
      ...state.chatHistory,
      [tool]: [...(state.chatHistory[tool] || []), message]
    }
  })),
  
  clearChatHistory: (tool) => set((state) => ({
    chatHistory: {
      ...state.chatHistory,
      [tool]: []
    }
  })),

  // Global methods
  clearAll: () => set({
    nodes: [],
    edges: [],
    customizations: {},
    currentProject: null,
    uploadedFiles: [],
    issues: [],
    generatedDocs: {},
    chatHistory: {}
  })
}));
