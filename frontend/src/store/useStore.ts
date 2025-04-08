import { create } from 'zustand';
import { Block, Connection } from '../types/block';

// Define view mode types
export type ViewMode = 'blocks' | 'layers' | 'neurons' | 'testResults' | 'codeVisualizer';

interface BlockState {
  // Original state
  blocks: Block[];
  connections: Connection[];
  selectedBlock: Block | null;
  
  // New state for view mode
  viewMode: ViewMode;
  
  // Original actions
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updatedData: Partial<Block>) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  setSelectedBlock: (block: Block | null) => void;
  
  // Direct update for ReactFlow nodes
  setNodes: (nodes: Block[]) => void;
  
  // New action for view mode
  setViewMode: (mode: ViewMode) => void;
}

export const useStore = create<BlockState>((set) => ({
  // Original state
  blocks: [],
  connections: [],
  selectedBlock: null,
  
  // New state for view mode
  viewMode: 'blocks',
  
  // Original actions
  addBlock: (block) =>
    set((state) => ({ blocks: [...state.blocks, block] })),
  
  removeBlock: (id) =>
    set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),
  
  updateBlock: (id, updatedData) =>
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (block.id !== id) return block;
        
        // Create a new block with the updated data
        const updatedBlock: Block = {
          id,
          type: block.type, // Keep original type to ensure it's defined
          position: updatedData.position || block.position,
          data: {
            ...block.data,
            ...(updatedData.data || {})
          }
        };
        
        return updatedBlock;
      }),
    })),
  
  // Direct setter for the entire nodes array
  setNodes: (nodes) => set({ blocks: nodes }),
  
  addConnection: (connection) =>
    set((state) => ({ connections: [...state.connections, connection] })),
  
  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),
    
  setSelectedBlock: (block) => set({ selectedBlock: block }),
  
  // New action for view mode
  setViewMode: (mode) => set({ viewMode: mode }),
}));