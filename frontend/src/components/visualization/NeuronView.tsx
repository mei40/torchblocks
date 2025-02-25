'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Block, Connection } from '../../types/block';
import { useStore } from '../../store/useStore';
import { traceNetworkPath, deriveNetworkSizes } from './networkUtils';

// Define neuron information type
interface NeuronInfo {
  id: string;
  layerType: string;
  layerIndex: number;
  neuronIndex: number;
  weights: number[];
  bias: number | null;
  activation: string;
}

interface NeuronViewProps {
  blocks: Block[];
  connections: Connection[];
}

// Generate consistent random weights for visualization
const getRandomWeights = (seed: number, count: number): number[] => {
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    // Use a simple deterministic formula based on seed and index
    const value = Math.sin(seed * (i + 1)) * 2;
    weights.push(+(value.toFixed(4)));
  }
  return weights;
};

// Generate consistent random bias
const getRandomBias = (seed: number): number => {
  return +(Math.sin(seed * 0.5).toFixed(4));
};

// Neuron Property Panel Component
const NeuronPropertyPanel: React.FC<{ neuronInfo: NeuronInfo | null }> = ({ neuronInfo }) => {
  if (!neuronInfo) {
    return (
      <div className="w-64 border-l border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Neuron Properties</h2>
        <div className="text-sm text-gray-500">
          Select a neuron to view its properties. Once a neuron is clicked, this panel will 
          show all details for the specific neuron.
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Neuron Properties</h2>
          
          {/* Layer badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            neuronInfo.layerType === 'input' ? 'bg-blue-100 text-blue-800' : 
            neuronInfo.layerType === 'hidden' ? 'bg-purple-100 text-purple-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {neuronInfo.layerType === 'input' ? 'Input' : 
             neuronInfo.layerType === 'hidden' ? 'Hidden' : 
             'Output'}
          </span>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">
            {neuronInfo.layerType === 'input' ? 'Input' : 
             neuronInfo.layerType === 'hidden' ? `Hidden Layer ${neuronInfo.layerIndex}` : 
             'Output'} Neuron {neuronInfo.neuronIndex + 1}
          </h3>
        </div>
        
        {neuronInfo.layerType !== 'input' && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold mb-2">Weights</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {neuronInfo.weights.slice(0, 8).map((weight, i) => (
                  <div 
                    key={`weight-${i}`} 
                    className={`text-xs p-2 rounded mb-1 ${
                      weight > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    W{i+1}: {weight.toFixed(4)}
                  </div>
                ))}
                {neuronInfo.weights.length > 8 && (
                  <div className="text-xs p-2 rounded bg-gray-100 text-gray-600">
                    +{neuronInfo.weights.length - 8} more
                  </div>
                )}
              </div>
            </div>
            
            {neuronInfo.bias !== null && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold mb-2">Bias</h4>
                <div className={`text-xs p-2 inline-block rounded ${
                  neuronInfo.bias > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  b = {neuronInfo.bias.toFixed(4)}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold mb-2">Activation Function</h4>
              <div className="text-xs bg-gray-50 p-3 rounded">
                {neuronInfo.activation === 'ReLU' ? (
                  <div>
                    <span className="font-semibold">ReLU</span>: f(x) = max(0, x)
                    <div className="mt-2 text-gray-600 text-xs">
                      Returns x if it is positive, otherwise returns 0.
                    </div>
                  </div>
                ) : neuronInfo.activation === 'Linear' ? (
                  <div>
                    <span className="font-semibold">Linear</span>: f(x) = x
                    <div className="mt-2 text-gray-600 text-xs">
                      Simply returns the input value.
                    </div>
                  </div>
                ) : (
                  neuronInfo.activation
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold mb-2">Computation</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                <div dangerouslySetInnerHTML={{ 
                  __html: `y = ${neuronInfo.activation === 'ReLU' ? 'ReLU(' : ''}
                  w₁·x₁ + w₂·x₂ + ... + w<sub>n</sub>·x<sub>n</sub> + b
                  ${neuronInfo.activation === 'ReLU' ? ')' : ''}`
                }} />
                <div className="mt-2 text-gray-600 text-xs">
                  Where x₁, x₂, ... are inputs from previous layer
                </div>
              </div>
            </div>
          </div>
        )}
        
        {neuronInfo.layerType === 'input' && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-semibold mb-2">Input Neuron</h4>
              <p className="text-xs text-gray-700">
                Input neurons represent features in your input data.
              </p>
              <div className="mt-3">
                <h5 className="text-sm font-medium">Information:</h5>
                <ul className="list-disc pl-4 mt-1 text-xs">
                  <li>Neuron Index: {neuronInfo.neuronIndex + 1}</li>
                  <li>Layer: Input (first layer)</li>
                  <li>No weights or bias</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Note: These are placeholder values for visualization purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

const NeuronView: React.FC<NeuronViewProps> = ({ blocks, connections }) => {
  // State for selected neuron
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronInfo | null>(null);
  
  if (blocks.length === 0) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center h-64 text-gray-500">
          No connected layers detected. Create a network structure first.
        </div>
        <NeuronPropertyPanel neuronInfo={null} />
      </div>
    );
  }
  
  // Process blocks for visualization
  const { layerMap } = traceNetworkPath(blocks, connections);
  const { inputSize, hiddenSizes, outputSize, maxLayer } = deriveNetworkSizes(blocks, connections, layerMap);

  // Create a neuron info object
  const createNeuronInfo = useCallback((layerType: string, layerIndex: number, neuronIndex: number, prevLayerSize: number): NeuronInfo => {
    // Use a deterministic seed for consistent random values
    const seed = layerIndex * 1000 + neuronIndex * 10;
    
    return {
      id: `${layerType}-${layerIndex}-${neuronIndex}`,
      layerType,
      layerIndex,
      neuronIndex,
      weights: layerType !== 'input' ? getRandomWeights(seed, prevLayerSize) : [],
      bias: layerType !== 'input' ? getRandomBias(seed) : null,
      activation: layerType === 'hidden' ? 'ReLU' : layerType === 'output' ? 'Linear' : 'None'
    };
  }, []);

  // Determine how many neurons to show in each layer
  const maxNeuronsToDisplay = 5;
  const inputNeurons = Math.min(inputSize, maxNeuronsToDisplay);
  const outputNeurons = Math.min(outputSize, maxNeuronsToDisplay);
  
  // Calculate viewBox dimensions based on layers
  const totalLayers = maxLayer + 1;
  const viewBoxWidth = Math.max(800, totalLayers * 200);
  const viewBoxHeight = 450;
  
  // Handle neuron click
  const handleNeuronClick = useCallback((layerType: string, layerIndex: number, neuronIndex: number, prevLayerSize: number) => {
    const neuronInfo = createNeuronInfo(layerType, layerIndex, neuronIndex, prevLayerSize);
    setSelectedNeuron(neuronInfo);
    
    // Add to console for debugging
    console.log("Selected neuron:", neuronInfo);
  }, [createNeuronInfo]);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 overflow-auto">
        <div className="border rounded-lg bg-white p-4 h-full">
          <svg 
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
            className="w-full"
            style={{ minHeight: '350px' }}
          >
            {/* Draw layer labels */}
            <text x="50" y="30" className="text-lg font-medium">Input Layer</text>
            {hiddenSizes.map((_, i) => (
              <text 
                key={`label-hidden-${i}`} 
                x={250 + i * 200} 
                y="30" 
                className="text-lg font-medium"
              >
                Hidden Layer {i+1}
              </text>
            ))}
            <text 
              x={250 + hiddenSizes.length * 200} 
              y="30" 
              className="text-lg font-medium"
            >
              Output Layer
            </text>

            {/* Draw input neurons */}
            {Array.from({ length: inputNeurons }).map((_, i) => {
              const yPos = 100 + i * 50;
              const isSelected = selectedNeuron?.id === `input-0-${i}`;
              
              return (
                <g 
                  key={`input-${i}`} 
                  transform={`translate(50, ${yPos})`}
                  onClick={() => handleNeuronClick('input', 0, i, 0)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle 
                    r="20" 
                    fill="#a5f3fc" 
                    stroke={isSelected ? "#ff0000" : "#0ea5e9"}
                    strokeWidth={isSelected ? "4" : "2"} 
                  />
                  
                  {/* Draw connections to first hidden layer */}
                  {hiddenSizes.length > 0 && Array.from({ length: Math.min(hiddenSizes[0], maxNeuronsToDisplay) }).map((_, h) => (
                    <path
                      key={`conn-in-h1-${i}-${h}`}
                      d={`M 20,0 L 180,${100 + h * 50 - yPos}`}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      opacity="0.2"
                    />
                  ))}
                  
                  {/* Direct connections to output if no hidden layers */}
                  {hiddenSizes.length === 0 && Array.from({ length: outputNeurons }).map((_, o) => (
                    <path
                      key={`conn-in-out-${i}-${o}`}
                      d={`M 20,0 L 180,${100 + o * 50 - yPos}`}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      opacity="0.2"
                    />
                  ))}
                </g>
              );
            })}

            {/* Draw hidden layers */}
            {hiddenSizes.map((hiddenSize, layerIndex) => {
              const neuronsToShow = Math.min(hiddenSize, maxNeuronsToDisplay);
              const xPos = 250 + layerIndex * 200;
              const prevLayerSize = layerIndex === 0 ? inputSize : hiddenSizes[layerIndex - 1];
              
              return Array.from({ length: neuronsToShow }).map((_, i) => {
                const yPos = 100 + i * 50;
                const isSelected = selectedNeuron?.id === `hidden-${layerIndex + 1}-${i}`;
                
                return (
                  <g 
                    key={`hidden-${layerIndex}-${i}`} 
                    transform={`translate(${xPos}, ${yPos})`}
                    onClick={() => handleNeuronClick('hidden', layerIndex + 1, i, prevLayerSize)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle 
                      r="20" 
                      fill="#1e40af" 
                      stroke={isSelected ? "#ff0000" : "#1d4ed8"}
                      strokeWidth={isSelected ? "4" : "2"} 
                    />
                    
                    {/* Connections to next layer */}
                    {layerIndex < hiddenSizes.length - 1 ? (
                      // Connect to next hidden layer
                      Array.from({ length: Math.min(hiddenSizes[layerIndex + 1], maxNeuronsToDisplay) }).map((_, h) => (
                        <path
                          key={`conn-h${layerIndex}-h${layerIndex+1}-${i}-${h}`}
                          d={`M 20,0 L 180,${100 + h * 50 - yPos}`}
                          stroke="#94a3b8"
                          strokeWidth="1"
                          opacity="0.2"
                        />
                      ))
                    ) : (
                      // Connect to output layer
                      Array.from({ length: outputNeurons }).map((_, o) => (
                        <path
                          key={`conn-h${layerIndex}-out-${i}-${o}`}
                          d={`M 20,0 L 180,${100 + o * 50 - yPos}`}
                          stroke="#94a3b8"
                          strokeWidth="1"
                          opacity="0.2"
                        />
                      ))
                    )}
                  </g>
                );
              });
            }).flat()}

            {/* Draw output neurons */}
            {Array.from({ length: outputNeurons }).map((_, i) => {
              const xPos = 250 + hiddenSizes.length * 200;
              const yPos = 100 + i * 50;
              const prevLayerSize = hiddenSizes.length > 0 ? hiddenSizes[hiddenSizes.length - 1] : inputSize;
              const isSelected = selectedNeuron?.id === `output-${maxLayer}-${i}`;
              
              return (
                <g 
                  key={`output-${i}`} 
                  transform={`translate(${xPos}, ${yPos})`}
                  onClick={() => handleNeuronClick('output', maxLayer, i, prevLayerSize)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle 
                    r="20" 
                    fill="#a5f3fc" 
                    stroke={isSelected ? "#ff0000" : "#0ea5e9"}
                    strokeWidth={isSelected ? "4" : "2"}
                  />
                </g>
              );
            })}
          </svg>
          
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
            <h3 className="font-medium text-sm mb-1">Network Structure</h3>
            <ul className="list-disc ml-4 text-xs text-gray-700">
              <li>Input Layer: <span className="font-medium">{inputSize}</span> total neurons</li>
              {hiddenSizes.map((size, i) => (
                <li key={`hidden-info-${i}`}>
                  Hidden Layer {i+1}: <span className="font-medium">{size}</span> neurons
                </li>
              ))}
              <li>Output Layer: <span className="font-medium">{outputSize}</span> output neurons</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Click on any neuron to see its details in the properties panel.
            </p>
          </div>
        </div>
      </div>
      
      {/* Properties Panel on the right */}
      <NeuronPropertyPanel neuronInfo={selectedNeuron} />
    </div>
  );
};

export default NeuronView;
