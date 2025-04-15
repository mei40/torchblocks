'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Node } from 'reactflow';
import { Block } from '../../types/block';

interface PropertyPanelProps {
  selectedNode: Node | null;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedNode }) => {
  const { updateBlock } = useStore();
  const [localParams, setLocalParams] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);

  // When selected node changes, reset the local state
  useEffect(() => {
    if (selectedNode) {
      // Initialize parameters from node data
      const initialParams: Record<string, any> = {};
      
      if (selectedNode.type === 'linear') {
        initialParams.in_features = selectedNode.data.parameters?.in_features || selectedNode.data.in_features || 784;
        initialParams.out_features = selectedNode.data.parameters?.out_features || selectedNode.data.out_features || 128;
        initialParams.bias = selectedNode.data.parameters?.bias !== undefined ? selectedNode.data.parameters.bias : true;
      } else if (selectedNode.type === 'conv2d') {
        initialParams.in_channels = selectedNode.data.parameters?.in_channels || selectedNode.data.in_channels || 3;
        initialParams.out_channels = selectedNode.data.parameters?.out_channels || selectedNode.data.channels || 64;
        initialParams.kernel_size = selectedNode.data.parameters?.kernel_size || selectedNode.data.kernel_size || 3;
        initialParams.stride = selectedNode.data.parameters?.stride || selectedNode.data.stride || 1;
        initialParams.padding = selectedNode.data.parameters?.padding || selectedNode.data.padding || 1;
      } else if (selectedNode.type === 'relu') {
        initialParams.inplace = selectedNode.data.parameters?.inplace !== undefined ? selectedNode.data.parameters.inplace : true;
      } else if (selectedNode.type === 'log_softmax') {
        initialParams.dim = selectedNode.data.parameters?.dim || selectedNode.data.dim || 1;
      } else if (selectedNode.type === 'view') {
        initialParams.out_shape = selectedNode.data.parameters?.out_shape || selectedNode.data.out_shape || '[batch_size, -1]';
      } else if (selectedNode.type === 'max_pool2d') {
        initialParams.kernel_size = selectedNode.data.parameters?.kernel_size || selectedNode.data.kernel_size || 2;
        initialParams.stride = selectedNode.data.parameters?.stride || selectedNode.data.stride || 2;
        initialParams.padding = selectedNode.data.parameters?.padding || selectedNode.data.padding || 0;
      } else if (selectedNode.type === 'crossentropyloss' || selectedNode.type === 'mseloss') {
        initialParams.reduction = selectedNode.data.parameters?.reduction || selectedNode.data.reduction || 'mean';
      } else if (selectedNode.type === 'adam') {
        initialParams.learning_rate = selectedNode.data.parameters?.learning_rate || selectedNode.data.learning_rate || 0.001;
        initialParams.weight_decay = selectedNode.data.parameters?.weight_decay || selectedNode.data.weight_decay || 0;
      } else if (selectedNode.type === 'sgd') {
        initialParams.learning_rate = selectedNode.data.parameters?.learning_rate || selectedNode.data.learning_rate || 0.001;
        initialParams.momentum = selectedNode.data.parameters?.momentum || selectedNode.data.momentum || 0;
        initialParams.weight_decay = selectedNode.data.parameters?.weight_decay || selectedNode.data.weight_decay || 0;
        initialParams.nesterov = selectedNode.data.parameters?.nesterov !== undefined ? selectedNode.data.parameters.nesterov : false;
      } else if (selectedNode.type === 'mnist') {
        initialParams.batch_size = selectedNode.data.parameters?.batch_size || selectedNode.data.batch_size || 64;
        initialParams.shuffle = selectedNode.data.parameters?.shuffle !== undefined ? selectedNode.data.parameters.shuffle : true;
      } else if (selectedNode.type === 'input') {
        initialParams.features = selectedNode.data.parameters?.features || selectedNode.data.features || 3;
      } else if (selectedNode.type === 'output') {
        initialParams.neurons = selectedNode.data.parameters?.neurons || selectedNode.data.neurons || 1;
      }
      
      setLocalParams(initialParams);
    } else {
      setLocalParams({});
    }
    
    setIsDirty(false);
  }, [selectedNode]);

  // Handle parameter changes
  const handleInputChange = (paramName: string, value: any) => {
    let processedValue = value;
    
    // Process numeric inputs
    if (typeof localParams[paramName] === 'number') {
      // Handle empty input (allow user to clear the field)
      if (value === '') {
        processedValue = '';
      } else {
        // Remove leading zeros (except for decimal numbers)
        if (value.startsWith('0') && value.length > 1 && value[1] !== '.') {
          value = value.replace(/^0+/, '');
        }
        
        // Convert to number if valid
        const numberValue = Number(value);
        if (!isNaN(numberValue)) {
          processedValue = numberValue;
        } else {
          return; // Don't update if not a valid number
        }
      }
    }
    
    // Process boolean inputs
    if (typeof localParams[paramName] === 'boolean') {
      processedValue = value === 'true';
    }
    
    // Update local state
    setLocalParams(prev => ({
      ...prev,
      [paramName]: processedValue
    }));
    
    setIsDirty(true);
  };

  // Apply changes to the node
  const applyChanges = () => {
    if (!selectedNode || !isDirty) return;
    
    // Convert any empty string values back to numbers
    const finalParams = { ...localParams };
    for (const key in finalParams) {
      if (finalParams[key] === '' && typeof selectedNode.data.parameters?.[key] === 'number') {
        finalParams[key] = 0;
      }
    }

    // Create updated node data with all the necessary properties
    const updatedData = {
      ...selectedNode.data,
      parameters: { ...finalParams }
    };
    
    // IMPORTANT: Copy parameters to direct properties for proper display in nodes
    if (selectedNode.type === 'linear') {
      updatedData.in_features = finalParams.in_features;
      updatedData.out_features = finalParams.out_features;
    } else if (selectedNode.type === 'conv2d') {
      updatedData.in_channels = finalParams.in_channels;
      updatedData.channels = finalParams.out_channels;
      updatedData.kernel_size = finalParams.kernel_size;
      updatedData.stride = finalParams.stride;
      updatedData.padding = finalParams.padding;
    } else if (selectedNode.type === 'input') {
      updatedData.features = finalParams.features;
    } else if (selectedNode.type === 'output') {
      updatedData.neurons = finalParams.neurons;
    } else if (selectedNode.type === 'view') {
      updatedData.out_shape = finalParams.out_shape;
    } else if (selectedNode.type === 'max_pool2d') {
      updatedData.kernel_size = finalParams.kernel_size;
      updatedData.stride = finalParams.stride;
      updatedData.padding = finalParams.padding;
    } else if (selectedNode.type === 'log_softmax') {
      updatedData.dim = finalParams.dim;
    } else if (selectedNode.type === 'adam') {
      updatedData.learning_rate = finalParams.learning_rate;
      updatedData.weight_decay = finalParams.weight_decay;
    } else if (selectedNode.type === 'sgd') {
      updatedData.learning_rate = finalParams.learning_rate;
      updatedData.momentum = finalParams.momentum;
      updatedData.weight_decay = finalParams.weight_decay;
      updatedData.nesterov = finalParams.nesterov;
    } else if (selectedNode.type === 'mnist') {
      updatedData.batch_size = finalParams.batch_size;
      updatedData.shuffle = finalParams.shuffle;
    } else if (selectedNode.type === 'crossentropyloss' || selectedNode.type === 'mseloss') {
      updatedData.reduction = finalParams.reduction;
    }
    
    // Force ReactFlow to re-render by adding a unique key
    updatedData._renderKey = Date.now();
    
    // Create a block update object - IMPORTANT: Don't modify the position
    const updatedBlock: Partial<Block> = {
      id: selectedNode.id,
      data: updatedData,
      // DO NOT include position here to avoid resetting the position
    };
    
    // Update the block in the store
    updateBlock(selectedNode.id, updatedBlock);
    
    setIsDirty(false);
  };

  // Safe toString helper function
  const safeToString = (value: any): string => {
    return value !== undefined && value !== null ? value.toString() : 'false';
  };

  // Render different forms based on node type
  const renderForm = () => {
    switch (selectedNode?.type) {
      case 'linear':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="in_features" className="block text-sm font-medium text-gray-700 mb-1">
                Input Features
              </label>
              <input
                id="in_features"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.in_features}
                onChange={(e) => handleInputChange('in_features', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="out_features" className="block text-sm font-medium text-gray-700 mb-1">
                Output Features
              </label>
              <input
                id="out_features"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.out_features}
                onChange={(e) => handleInputChange('out_features', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="bias" className="block text-sm font-medium text-gray-700 mb-1">
                Bias
              </label>
              <select
                id="bias"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={safeToString(localParams.bias)}
                onChange={(e) => handleInputChange('bias', e.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        );
        
      case 'conv2d':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="in_channels" className="block text-sm font-medium text-gray-700 mb-1">
                Input Channels
              </label>
              <input
                id="in_channels"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.in_channels}
                onChange={(e) => handleInputChange('in_channels', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="out_channels" className="block text-sm font-medium text-gray-700 mb-1">
                Output Channels
              </label>
              <input
                id="out_channels"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.out_channels}
                onChange={(e) => handleInputChange('out_channels', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="kernel_size" className="block text-sm font-medium text-gray-700 mb-1">
                Kernel Size
              </label>
              <input
                id="kernel_size"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.kernel_size}
                onChange={(e) => handleInputChange('kernel_size', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="stride" className="block text-sm font-medium text-gray-700 mb-1">
                Stride
              </label>
              <input
                id="stride"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.stride}
                onChange={(e) => handleInputChange('stride', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="padding" className="block text-sm font-medium text-gray-700 mb-1">
                Padding
              </label>
              <input
                id="padding"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.padding}
                onChange={(e) => handleInputChange('padding', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'relu':
        return (
          <div>
            <label htmlFor="inplace" className="block text-sm font-medium text-gray-700 mb-1">
              Inplace
            </label>
            <select
              id="inplace"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={safeToString(localParams.inplace)}
              onChange={(e) => handleInputChange('inplace', e.target.value)}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        );
        
      case 'log_softmax':
        return (
          <div>
            <label htmlFor="dim" className="block text-sm font-medium text-gray-700 mb-1">
              Dimension
            </label>
            <input
              id="dim"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={localParams.dim}
              onChange={(e) => handleInputChange('dim', e.target.value)}
            />
          </div>
        );
        
      case 'view':
        return (
          <div>
            <label htmlFor="out_shape" className="block text-sm font-medium text-gray-700 mb-1">
              Output Shape
            </label>
            <input
              id="out_shape"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={localParams.out_shape || ''}
              onChange={(e) => handleInputChange('out_shape', e.target.value)}
              placeholder="e.g., [batch_size, -1]"
            />
          </div>
        );
        
      case 'max_pool2d':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="kernel_size" className="block text-sm font-medium text-gray-700 mb-1">
                Kernel Size
              </label>
              <input
                id="kernel_size"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.kernel_size}
                onChange={(e) => handleInputChange('kernel_size', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="stride" className="block text-sm font-medium text-gray-700 mb-1">
                Stride
              </label>
              <input
                id="stride"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.stride}
                onChange={(e) => handleInputChange('stride', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="padding" className="block text-sm font-medium text-gray-700 mb-1">
                Padding
              </label>
              <input
                id="padding"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.padding}
                onChange={(e) => handleInputChange('padding', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'crossentropyloss':
      case 'mseloss':
        return (
          <div>
            <label htmlFor="reduction" className="block text-sm font-medium text-gray-700 mb-1">
              Reduction
            </label>
            <select
              id="reduction"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={localParams.reduction || 'mean'}
              onChange={(e) => handleInputChange('reduction', e.target.value)}
            >
              <option value="none">None</option>
              <option value="mean">Mean</option>
              <option value="sum">Sum</option>
            </select>
          </div>
        );
        
      case 'adam':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="learning_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Rate
              </label>
              <input
                id="learning_rate"
                type="text"
                inputMode="decimal"
                step="0.0001"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.learning_rate}
                onChange={(e) => handleInputChange('learning_rate', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="weight_decay" className="block text-sm font-medium text-gray-700 mb-1">
                Weight Decay
              </label>
              <input
                id="weight_decay"
                type="text"
                inputMode="decimal"
                step="0.0001"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.weight_decay}
                onChange={(e) => handleInputChange('weight_decay', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'sgd':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="learning_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Rate
              </label>
              <input
                id="learning_rate"
                type="text"
                inputMode="decimal"
                step="0.0001"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.learning_rate}
                onChange={(e) => handleInputChange('learning_rate', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="momentum" className="block text-sm font-medium text-gray-700 mb-1">
                Momentum
              </label>
              <input
                id="momentum"
                type="text"
                inputMode="decimal"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.momentum}
                onChange={(e) => handleInputChange('momentum', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="weight_decay" className="block text-sm font-medium text-gray-700 mb-1">
                Weight Decay
              </label>
              <input
                id="weight_decay"
                type="text"
                inputMode="decimal"
                step="0.0001"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.weight_decay}
                onChange={(e) => handleInputChange('weight_decay', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="nesterov" className="block text-sm font-medium text-gray-700 mb-1">
                Nesterov
              </label>
              <select
                id="nesterov"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={safeToString(localParams.nesterov)}
                onChange={(e) => handleInputChange('nesterov', e.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        );
        
      case 'mnist':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="batch_size" className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size
              </label>
              <input
                id="batch_size"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.batch_size}
                onChange={(e) => handleInputChange('batch_size', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="shuffle" className="block text-sm font-medium text-gray-700 mb-1">
                Shuffle
              </label>
              <select
                id="shuffle"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={safeToString(localParams.shuffle)}
                onChange={(e) => handleInputChange('shuffle', e.target.value)}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        );
        
      case 'input':
        return (
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
              Features
            </label>
            <input
              id="features"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={localParams.features}
              onChange={(e) => handleInputChange('features', e.target.value)}
            />
          </div>
        );
        
      case 'output':
        return (
          <div>
            <label htmlFor="neurons" className="block text-sm font-medium text-gray-700 mb-1">
              Neurons
            </label>
            <input
              id="neurons"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={localParams.neurons}
              onChange={(e) => handleInputChange('neurons', e.target.value)}
            />
          </div>
        );
        
      case 'sigmoid':
      case 'tanh':
        return (
          <div className="text-sm text-gray-500 italic py-2">
            This activation function has no editable parameters.
          </div>
        );
        
      default:
        return (
          <div className="text-sm text-gray-500 italic py-2">
            No editable parameters available for this component.
          </div>
        );
    }
  };

  return (
    <div className="w-64 border-l border-gray-200 bg-white h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        
        {/* Node header */}
        {selectedNode && (
          <div className="bg-gray-100 p-3 rounded-md mb-4">
            <h3 className="text-md font-medium">{selectedNode.data.label}</h3>
            <p className="text-xs text-gray-500 mt-1">Type: {selectedNode.type}</p>
            {selectedNode.position && (
              <p className="text-xs text-gray-500 mt-1">
                Position: x: {Math.round(selectedNode.position.x)}, y: {Math.round(selectedNode.position.y)}
              </p>
            )}
          </div>
        )}
        
        {/* Parameters form */}
        {selectedNode && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <span>Parameters</span>
              {isDirty && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Modified
                </span>
              )}
            </h4>
            
            <div className="border border-gray-200 rounded-md p-3">
              {renderForm()}
            </div>
          </div>
        )}
        
        {/* Apply button */}
        {selectedNode && isDirty && (
          <button
            onClick={applyChanges}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Apply Changes
          </button>
        )}
        
        {/* Transformation info if available */}
        {selectedNode && selectedNode.data.transformation && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Transformation</h4>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
              <code className="text-xs font-mono text-gray-800">
                {selectedNode.data.transformation}
              </code>
            </div>
          </div>
        )}
        
        {!selectedNode && (
          <div className="text-sm text-gray-500">
            Select a component to view and edit its properties.
          </div>
        )}
      </div>
    </div>
  );
};