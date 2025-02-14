import { create } from 'zustand';
import { Block, Connection } from '../types/block';

interface BlockState {
  blocks: Block[];
  connections: Connection[];
  selectedBlock: Block | null;
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, data: Partial<Block>) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  setSelectedBlock: (block: Block | null) => void;
}

export const useStore = create<BlockState>((set) => ({
  blocks: [],
  connections: [],
  selectedBlock: null,
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
}));
