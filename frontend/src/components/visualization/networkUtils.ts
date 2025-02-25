import { Block, Connection } from '../../types/block';

// Utility function to trace a path through the network
export const traceNetworkPath = (
  blocks: Block[], 
  connections: Connection[]
): {
  orderedBlocks: Block[];
  layerMap: Map<string, number>;
} => {
  const result: Block[] = [];
  const layerMap = new Map<string, number>();
  const visited = new Set<string>();
  const connectionMap = new Map<string, string[]>();
  
  // Map connections for faster lookup
  connections.forEach(conn => {
    if (!connectionMap.has(conn.source)) {
      connectionMap.set(conn.source, []);
    }
    connectionMap.get(conn.source)!.push(conn.target);
  });
  
  // Find input blocks (those with no incoming connections)
  const inputBlocks = blocks.filter(block => 
    !connections.some(conn => conn.target === block.id)
  );
  
  // Start tracing from each input block
  const queue: { block: Block; layer: number }[] = 
    inputBlocks.map(block => ({ block, layer: 0 }));
  
  while (queue.length > 0) {
    const { block, layer } = queue.shift()!;
    
    if (visited.has(block.id)) {
      // Already processed this block, but might need to update its layer
      if ((layerMap.get(block.id) || 0) < layer) {
        layerMap.set(block.id, layer);
      }
      continue;
    }
    
    visited.add(block.id);
    result.push(block);
    layerMap.set(block.id, layer);
    
    // Add connected blocks to the queue
    const connectedBlockIds = connectionMap.get(block.id) || [];
    for (const targetId of connectedBlockIds) {
      const targetBlock = blocks.find(b => b.id === targetId);
      if (targetBlock) {
        queue.push({ block: targetBlock, layer: layer + 1 });
      }
    }
  }
  
  return { orderedBlocks: result, layerMap };
};

// Function to determine network feature sizes
export const deriveNetworkSizes = (
  blocks: Block[],
  connections: Connection[],
  layerMap: Map<string, number>
): {
  inputSize: number;
  hiddenSizes: number[];
  outputSize: number;
  maxLayer: number;
} => {
  const layerSizes = new Map<number, number[]>();
  let inputSize = 3; // Default
  let outputSize = 1; // Default
  
  // Group blocks by layer
  blocks.forEach(block => {
    const layer = layerMap.get(block.id) || 0;
    if (!layerSizes.has(layer)) {
      layerSizes.set(layer, []);
    }
    
    // Get the size for this block
    let size = 64; // Default size
    
    if (block.type === 'input') {
      size = block.data.parameters?.features || 3;
      inputSize = size;
    } else if (block.type === 'output') {
      size = block.data.parameters?.neurons || 1;
      outputSize = size;
    } else if (block.type === 'linear') {
      size = block.data.parameters?.out_features || 128;
    } else if (block.type === 'conv2d') {
      size = block.data.parameters?.out_channels || 64;
    }
    
    layerSizes.get(layer)!.push(size);
  });
  
  // Determine max layer
  const maxLayer = Math.max(...Array.from(layerSizes.keys()), 0);
  
  // Determine sizes for hidden layers
  const hiddenSizes: number[] = [];
  for (let i = 1; i < maxLayer; i++) {
    const sizes = layerSizes.get(i) || [];
    if (sizes.length > 0) {
      // Use the max size from this layer
      hiddenSizes.push(Math.max(...sizes));
    }
  }
  
  return { inputSize, hiddenSizes, outputSize, maxLayer };
};

// Function to determine if a network is valid
export const isValidNetwork = (blocks: Block[], connections: Connection[]): boolean => {
  // Must have at least one input and one output
  const hasInput = blocks.some(block => block.type === 'input' || 
                                        connections.every(conn => conn.target !== block.id));
  
  const hasOutput = blocks.some(block => block.type === 'output' || 
                                         connections.every(conn => conn.source !== block.id));
  
  if (!hasInput || !hasOutput) {
    return false;
  }
  
  // All blocks must be connected (no isolated blocks)
  const { orderedBlocks } = traceNetworkPath(blocks, connections);
  if (orderedBlocks.length !== blocks.length) {
    return false;
  }
  
  return true;
};

// Function to count the number of separate networks
export const countNetworks = (blocks: Block[], connections: Connection[]): number => {
  if (blocks.length === 0) return 0;
  
  const visited = new Set<string>();
  const adjacencyList = new Map<string, string[]>();
  
  // Build adjacency list in both directions
  blocks.forEach(block => {
    adjacencyList.set(block.id, []);
  });
  
  connections.forEach(conn => {
    adjacencyList.get(conn.source)?.push(conn.target);
    // For connected component analysis, we need undirected connections
    adjacencyList.get(conn.target)?.push(conn.source); 
  });
  
  // DFS to find connected components
  const dfs = (blockId: string) => {
    visited.add(blockId);
    const neighbors = adjacencyList.get(blockId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  };
  
  let networkCount = 0;
  
  // Count connected components
  for (const block of blocks) {
    if (!visited.has(block.id)) {
      networkCount++;
      dfs(block.id);
    }
  }
  
  return networkCount;
};
