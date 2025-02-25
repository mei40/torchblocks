import { Block, Connection } from '../../types/block';
import { traceNetworkPath } from './networkUtils';

/**
 * Converts the network blocks and connections to a JSON format
 * compatible with the backend ANTLR parser
 */
export const convertNetworkToJson = (blocks: Block[], connections: Connection[]): string => {
  // Process blocks to get them in order
  const { orderedBlocks, layerMap } = traceNetworkPath(blocks, connections);
  
  // Group blocks by layer
  const layerBlocks = new Map<number, Block[]>();
  orderedBlocks.forEach(block => {
    const layer = layerMap.get(block.id) || 0;
    if (!layerBlocks.has(layer)) {
      layerBlocks.set(layer, []);
    }
    layerBlocks.get(layer)!.push(block);
  });
  
  // Convert to layers array
  const layers: any[] = [];
  
  // Process each layer in order
  Array.from(layerBlocks.keys())
    .sort((a, b) => a - b)
    .forEach(layerIndex => {
      const blocksInLayer = layerBlocks.get(layerIndex) || [];
      
      // Process each block in the layer
      blocksInLayer.forEach(block => {
        // Skip input and output blocks as they're not actual layers
        if (block.type === 'input' || block.type === 'output') return;
        
        // Create layer object based on block type
        let layerObj: any = {
          layer_type: block.type
        };
        
        // Add parameters based on block type
        if (block.type === 'linear') {
          // Find input connections to determine in_shape
          const inConnections = connections.filter(conn => conn.target === block.id);
          const sourceBlocks = inConnections.map(conn => 
            blocks.find(b => b.id === conn.source)
          ).filter(Boolean);
          
          const inShape = sourceBlocks.length > 0 && sourceBlocks[0]?.data.parameters?.out_features
            ? sourceBlocks[0]?.data.parameters?.out_features
            : block.data.parameters?.in_features || 64;
            
          layerObj = {
            ...layerObj,
            in_shape: inShape,
            out_shape: block.data.parameters?.out_features || 128
          };
        } else if (block.type === 'conv2d') {
          layerObj = {
            ...layerObj,
            in_channels: block.data.parameters?.in_channels || 3,
            out_channels: block.data.parameters?.out_channels || 64,
            kernel_size: block.data.parameters?.kernel_size || 3,
            stride: block.data.parameters?.stride || 1,
            padding: block.data.parameters?.padding || 0
          };
        } else if (block.type === 'relu') {
          // Include any ReLU parameters
          if (block.data.parameters) {
            Object.entries(block.data.parameters).forEach(([key, value]) => {
              layerObj[key] = value;
            });
          }
        } else if (block.type === 'log_softmax' || block.type === 'softmax') {
          // Include any softmax parameters
          if (block.data.parameters) {
            Object.entries(block.data.parameters).forEach(([key, value]) => {
              layerObj[key] = value;
            });
          }
        } else {
          // For any other layer types, include all parameters
          if (block.data.parameters) {
            Object.entries(block.data.parameters).forEach(([key, value]) => {
              layerObj[key] = value;
            });
          }
        }
        
        layers.push(layerObj);
      });
    });
  
  // Create the final JSON structure
  const modelJson = {
    packet_type: "model_params",
    model: {
      layers: layers
    }
  };
  
  return JSON.stringify(modelJson, null, 2);
};

/**
 * Downloads the network as a JSON file
 */
export const downloadNetworkJson = (blocks: Block[], connections: Connection[], filename = 'model.json') => {
  const jsonContent = convertNetworkToJson(blocks, connections);
  
  // Create a blob with the JSON content
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Saves the network JSON to the server's build folder
 */
export const saveNetworkJsonToServer = async (
  blocks: Block[], 
  connections: Connection[], 
  filename = 'model.json'
): Promise<{ success: boolean; message: string }> => {
  try {
    const jsonContent = convertNetworkToJson(blocks, connections);
    
    const response = await fetch('/api/save-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonContent, filename }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save model');
    }
    
    return { 
      success: true, 
      message: result.message || `Model saved to build/${filename}`
    };
  } catch (error) {
    console.error('Error saving model to server:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 