import { create } from 'zustand';
import { Block, Connection } from '../types/block';

// Define view mode types
export type ViewMode = 'blocks' | 'layers' | 'neurons';

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
  updateBlock: (id: string, data: Partial<Block>) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  setSelectedBlock: (block: Block | null) => void;
  
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
  updateBlock: (id, data) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
    })),
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