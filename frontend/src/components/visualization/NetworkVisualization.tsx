'use client';

import React, { useState, useMemo } from 'react';
import { Block, Connection } from '../../types/block';
import { useStore } from '../../store/useStore';
import { traceNetworkPath, deriveNetworkSizes, countNetworks } from './networkUtils';
import NeuronView from './NeuronView';

// Component to visualize blocks as they are currently arranged
const BlocksView: React.FC = () => {
  const { blocks, connections } = useStore();
  
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No blocks added yet. Drag components from the sidebar to start building.
      </div>
    );
  }

  // Process blocks for visualization
  const { orderedBlocks, layerMap } = traceNetworkPath(blocks, connections);
  
  // Group blocks by layer
  const layeredBlocks = new Map<number, Block[]>();
  orderedBlocks.forEach(block => {
    const layer = layerMap.get(block.id) || 0;
    if (!layeredBlocks.has(layer)) {
      layeredBlocks.set(layer, []);
    }
    layeredBlocks.get(layer)!.push(block);
  });
  
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Network Structure</h3>
      <div className="flex flex-wrap gap-4 justify-center p-4">
        {Array.from(layeredBlocks.entries())
          .sort(([a], [b]) => a - b)
          .map(([layer, blocksList]) => (
            <div key={layer} className="flex flex-col items-center">
              <div className="text-sm text-gray-500 mb-2">
                {layer === 0 ? 'Input' : layer === Math.max(...Array.from(layeredBlocks.keys())) ? 'Output' : `Layer ${layer}`}
              </div>
              <div className="flex flex-col gap-2">
                {blocksList.map(block => (
                  <div 
                    key={block.id} 
                    className={`p-3 border rounded-md shadow-sm ${
                      block.type === 'input' ? 'bg-gray-100' :
                      block.type === 'output' ? 'bg-green-100' :
                      block.type === 'relu' ? 'bg-yellow-100' :
                      block.type === 'conv2d' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}
                  >
                    <div className="font-medium">{block.data.label}</div>
                    {block.data.parameters && (
                      <div className="text-xs mt-1">
                        {Object.entries(block.data.parameters)
                          .filter(([key]) => !key.includes('inplace'))
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {layer < Math.max(...Array.from(layeredBlocks.keys())) && (
                <div className="my-2">→</div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

// Component to visualize the network as layers
const LayersView: React.FC = () => {
  const { blocks, connections } = useStore();
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No connected layers detected. Create a network structure first.
      </div>
    );
  }

  // Process blocks for visualization
  const { layerMap } = traceNetworkPath(blocks, connections);
  const { inputSize, hiddenSizes, outputSize, maxLayer } = deriveNetworkSizes(blocks, connections, layerMap);
  
  // Group blocks by layer
  const layeredBlocks = new Map<number, Block[]>();
  blocks.forEach(block => {
    const layer = layerMap.get(block.id) || 0;
    if (!layeredBlocks.has(layer)) {
      layeredBlocks.set(layer, []);
    }
    layeredBlocks.get(layer)!.push(block);
  });

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${Math.max(800, (maxLayer + 1) * 200)} 200`} className="w-full h-48">
        {/* Draw layers */}
        {Array.from(layeredBlocks.keys()).sort().map(layer => {
          const xPos = 100 + layer * 200;
          const blocks = layeredBlocks.get(layer) || [];
          
          // Determine layer properties
          let layerName = `Layer ${layer}`;
          let fillColor = '#bfdbfe'; // Default blue
          let strokeColor = '#3b82f6';
          let featureCount = hiddenSizes[layer - 1] || 128;
          
          if (layer === 0) {
            layerName = 'Input Layer';
            fillColor = '#e2e8f0';
            strokeColor = '#64748b';
            featureCount = inputSize;
          } else if (layer === maxLayer) {
            layerName = 'Output Layer';
            fillColor = '#86efac';
            strokeColor = '#22c55e';
            featureCount = outputSize;
          }
          
          // Determine if there are activations in this layer
          const hasActivation = blocks.some(b => b.type === 'relu');
          
          return (
            <React.Fragment key={layer}>
              {/* Draw connection to previous layer */}
              {layer > 0 && (
                <path 
                  d={`M ${xPos - 150},100 L ${xPos - 50},100`} 
                  stroke="#64748b" 
                  strokeWidth="2" 
                />
              )}
              
              {/* Draw layer */}
              <g transform={`translate(${xPos}, 100)`}>
                <rect 
                  x="-40" 
                  y="-60" 
                  width="80" 
                  height="120" 
                  fill={fillColor} 
                  stroke={strokeColor}
                  strokeWidth={selectedLayer === layer ? "3" : "1"}
                  className="cursor-pointer hover:stroke-blue-500"
                  onClick={() => setSelectedLayer(layer)}
                />
                <text x="0" y="-30" textAnchor="middle" className="text-sm font-medium">
                  {layerName}
                </text>
                <text x="0" y="0" textAnchor="middle" className="text-sm">
                  {layer === 0 ? `${featureCount} features` : `${featureCount} neurons`}
                </text>
                {hasActivation && (
                  <text x="0" y="30" textAnchor="middle" className="text-sm text-gray-600">
                    ReLU
                  </text>
                )}
              </g>
            </React.Fragment>
          );
        })}
      </svg>
      
      {/* Layer Details */}
      {selectedLayer !== null && (
        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-2">Layer Details</h3>
          <div className="space-y-2">
            {selectedLayer === 0 && (
              <>
                <p className="font-medium">Input Layer</p>
                <ul className="list-disc ml-4 text-sm">
                  <li>Features: {inputSize}</li>
                  <li>Type: Feature input</li>
                  {blocks.filter(b => layerMap.get(b.id) === selectedLayer).map(block => (
                    <li key={block.id}>Block: {block.data.label}</li>
                  ))}
                </ul>
              </>
            )}
            {selectedLayer > 0 && selectedLayer < maxLayer && (
              <>
                <p className="font-medium">Hidden Layer {selectedLayer}</p>
                <ul className="list-disc ml-4 text-sm">
                  <li>Neurons: {hiddenSizes[selectedLayer - 1]}</li>
                  {blocks.filter(b => layerMap.get(b.id) === selectedLayer).some(b => b.type === 'relu') && (
                    <li>Activation: ReLU</li>
                  )}
                  {blocks.filter(b => layerMap.get(b.id) === selectedLayer).map(block => (
                    <li key={block.id}>Block: {block.data.label}</li>
                  ))}
                </ul>
              </>
            )}
            {selectedLayer === maxLayer && (
              <>
                <p className="font-medium">Output Layer</p>
                <ul className="list-disc ml-4 text-sm">
                  <li>Neurons: {outputSize}</li>
                  <li>Type: {outputSize > 1 ? 'Classification' : 'Regression'}</li>
                  {blocks.filter(b => layerMap.get(b.id) === selectedLayer).map(block => (
                    <li key={block.id}>Block: {block.data.label}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component that switches between views
const NetworkVisualization: React.FC = () => {
  const { blocks, connections, viewMode } = useStore();
  const networkCount = useMemo(() => countNetworks(blocks, connections), [blocks, connections]);
  
  return (
    <div className={viewMode === 'neurons' ? 'h-full' : 'p-4 border rounded-md bg-white'}>
      {/* Multiple networks warning */}
      {blocks.length > 0 && networkCount > 1 && viewMode !== 'neurons' && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          <p className="font-semibold">Multiple Networks Detected</p>
          <p className="text-sm">
            There are {networkCount} separate networks in your workspace. 
            The visualization will display them as a single model, but they are not connected.
          </p>
        </div>
      )}
    
      {viewMode === 'blocks' && <BlocksView />}
      {viewMode === 'layers' && <LayersView />}
      {viewMode === 'neurons' && <NeuronView blocks={blocks} connections={connections} />}
    </div>
  );
};

export default NetworkVisualization;
export { BlocksView, LayersView };
