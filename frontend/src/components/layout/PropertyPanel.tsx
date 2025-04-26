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
  // New state for nested components
  const [activeTab, setActiveTab] = useState<string>('main');

  // When selected node changes, reset the local state
  useEffect(() => {
    if (selectedNode) {
      // Reset tab to main when node changes
      if (selectedNode.type === 'input') {
        setActiveTab('dataset');
      } else if (selectedNode.type === 'output') {
        setActiveTab('loss');
      } else {
        setActiveTab('main');
      }
      
      // Initialize parameters from node data
      const initialParams: Record<string, any> = {};
      
      if (selectedNode.type === 'linear') {
        initialParams.in_features = selectedNode.data.parameters?.in_features || 784;
        initialParams.out_features = selectedNode.data.parameters?.out_features || 128;
      } else if (selectedNode.type === 'conv2d') {
        initialParams.in_channels = selectedNode.data.parameters?.in_channels || 3;
        initialParams.out_channels = selectedNode.data.parameters?.out_channels || 64;
        initialParams.kernel_size = selectedNode.data.parameters?.kernel_size || 3;
        initialParams.stride = selectedNode.data.parameters?.stride || 1;
        initialParams.padding = selectedNode.data.parameters?.padding || 1;
      } else if (selectedNode.type === 'max_pool2d') {
        initialParams.kernel_size = selectedNode.data.parameters?.kernel_size || 2;
        initialParams.stride = selectedNode.data.parameters?.stride || 2;
        initialParams.padding = selectedNode.data.parameters?.padding || 0;
      } else if (selectedNode.type === 'view') {
        initialParams.out_shape = selectedNode.data.parameters?.out_shape || '[batch_size, -1]';
      } else if (selectedNode.type === 'log_softmax') {
        // LogSoftmax doesn't need parameters
      } else if (selectedNode.type === 'input') {
        // Input node embeds a dataset
        initialParams.dataset_type = selectedNode.data.dataset?.type || 'mnist';
        
        // Add dataset shape parameters - NEW CODE
        initialParams.channels = selectedNode.data.dataset?.shape?.channels || 
          (selectedNode.data.dataset?.type === 'cifar10' ? 3 : 1);
        initialParams.height = selectedNode.data.dataset?.shape?.height || 
          (selectedNode.data.dataset?.type === 'cifar10' ? 32 : 28);
        initialParams.width = selectedNode.data.dataset?.shape?.width || 
          (selectedNode.data.dataset?.type === 'cifar10' ? 32 : 28);
      } else if (selectedNode.type === 'output') {
        // Output node embeds loss function and optimizer
        initialParams.loss_type = selectedNode.data.lossFunction?.type || 'crossentropyloss';
        initialParams.optimizer_type = selectedNode.data.optimizer?.type || 'adam';
        initialParams.learning_rate = selectedNode.data.optimizer?.parameters?.learning_rate || 0.001;
        
        if (selectedNode.data.optimizer?.type === 'sgd') {
          initialParams.momentum = selectedNode.data.optimizer?.parameters?.momentum || 0;
        }
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
    
    // Special handling for dataset type to update shape defaults
    if (paramName === 'dataset_type') {
      if (value === 'mnist' && localParams.dataset_type !== 'mnist') {
        // If switching to MNIST, update shape to default MNIST shape
        setLocalParams(prev => ({
          ...prev,
          [paramName]: processedValue,
          channels: 1,
          height: 28, 
          width: 28
        }));
        setIsDirty(true);
        return;
      } else if (value === 'cifar10' && localParams.dataset_type !== 'cifar10') {
        // If switching to CIFAR10, update shape to default CIFAR10 shape
        setLocalParams(prev => ({
          ...prev,
          [paramName]: processedValue,
          channels: 3,
          height: 32,
          width: 32
        }));
        setIsDirty(true);
        return;
      }
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
    let updatedData = { ...selectedNode.data };
    
    // Update based on node type
    if (selectedNode.type === 'input') {
      // Update the dataset embedded in the input node
      updatedData = {
        ...updatedData,
        dataset: {
          type: finalParams.dataset_type,
          parameters: {},
          // Add shape information to dataset - NEW CODE
          shape: {
            channels: finalParams.channels,
            height: finalParams.height,
            width: finalParams.width
          }
        }
      };
    } 
    else if (selectedNode.type === 'output') {
      // Update the loss function and optimizer embedded in the output node
      updatedData = {
        ...updatedData,
        lossFunction: {
          type: finalParams.loss_type,
          parameters: {}
        },
        optimizer: {
          type: finalParams.optimizer_type,
          parameters: {
            learning_rate: finalParams.learning_rate
          }
        }
      };
      
      // Add momentum parameter if SGD optimizer
      if (finalParams.optimizer_type === 'sgd') {
        updatedData.optimizer.parameters.momentum = finalParams.momentum;
      }
    }
    else {
      // Update parameters for regular nodes
      updatedData = {
        ...updatedData,
        parameters: { 
          ...updatedData.parameters,
          ...Object.fromEntries(
            Object.entries(finalParams).filter(([key]) => 
              !key.startsWith('dataset_') && 
              !key.startsWith('loss_') && 
              !key.startsWith('optimizer_') &&
              key !== 'learning_rate' &&
              key !== 'momentum' &&
              key !== 'channels' &&  // Exclude dataset shape params
              key !== 'height' &&    // from regular parameter updates
              key !== 'width'
            )
          )
        }
      };
    }
    
    // Force ReactFlow to re-render by adding a unique key
    updatedData._renderKey = Date.now();
    
    // Create a block update object
    const updatedBlock: Partial<Block> = {
      id: selectedNode.id,
      data: updatedData,
    };
    
    // Update the block in the store
    updateBlock(selectedNode.id, updatedBlock);
    
    setIsDirty(false);
  };

  // Render different forms based on node type and active tab
  const renderForm = () => {
    if (!selectedNode) return null;
    
    // For Input node
    if (selectedNode.type === 'input') {
      return (
        <div className="space-y-4">
          {/* Tabs for dataset editing */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'main' || activeTab === 'dataset' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dataset')}
            >
              Dataset
            </button>
            
            {/* Add a new tab for shape editing */}
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'shape' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('shape')}
            >
              Shape
            </button>
          </div>
          
          {/* Dataset Form */}
          {activeTab === 'dataset' && (
            <div>
              <label htmlFor="dataset_type" className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Type
              </label>
              <select
                id="dataset_type"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.dataset_type || 'mnist'}
                onChange={(e) => handleInputChange('dataset_type', e.target.value)}
              >
                <option value="mnist">MNIST</option>
                <option value="cifar10">CIFAR10</option>
              </select>
              
              {/* Dataset info based on type */}
              <div className="mt-3 text-xs text-gray-500">
                <p>Default shape:</p>
                <p className="font-mono">
                  {localParams.dataset_type === 'mnist' ? '(1, 28, 28)' : '(3, 32, 32)'}
                </p>
                <p className="mt-2">Customize shape in the Shape tab.</p>
              </div>
            </div>
          )}
          
          {/* Shape Form - NEW CODE */}
          {activeTab === 'shape' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="channels" className="block text-sm font-medium text-gray-700 mb-1">
                  Channels
                </label>
                <input
                  id="channels"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={localParams.channels}
                  onChange={(e) => handleInputChange('channels', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  id="height"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={localParams.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  id="width"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={localParams.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p>Current shape: ({localParams.channels}, {localParams.height}, {localParams.width})</p>
                <p className="mt-1">Note: Changing these values may require adjusting subsequent layers.</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // For Output node
    else if (selectedNode.type === 'output') {
      return (
        <div className="space-y-4">
          {/* Tabs for different components */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'loss' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('loss')}
            >
              Loss Function
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'optimizer' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('optimizer')}
            >
              Optimizer
            </button>
          </div>
          
          {/* Loss Function Form */}
          {activeTab === 'loss' && (
            <div>
              <label htmlFor="loss_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loss Function Type
              </label>
              <select
                id="loss_type"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={localParams.loss_type || 'crossentropyloss'}
                onChange={(e) => handleInputChange('loss_type', e.target.value)}
              >
                <option value="crossentropyloss">CrossEntropyLoss</option>
                <option value="mseloss">MSELoss</option>
              </select>
            </div>
          )}
          
          {/* Optimizer Form */}
          {activeTab === 'optimizer' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="optimizer_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Optimizer Type
                </label>
                <select
                  id="optimizer_type"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={localParams.optimizer_type || 'adam'}
                  onChange={(e) => handleInputChange('optimizer_type', e.target.value)}
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                </select>
              </div>
              
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
              
              {localParams.optimizer_type === 'sgd' && (
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
              )}
            </div>
          )}
        </div>
      );
    }
    
    // For Linear layer
    else if (selectedNode.type === 'linear') {
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
        </div>
      );
    }
    
    // For Conv2D layer
    else if (selectedNode.type === 'conv2d') {
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
    }
    
    // For View layer
    else if (selectedNode.type === 'view') {
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
    }
    
    // For MaxPool2D layer
    else if (selectedNode.type === 'max_pool2d') {
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
    }
    
    // For activation functions with no parameters
    else if (['relu', 'sigmoid', 'tanh', 'log_softmax'].includes(selectedNode.type ?? '')) {
      return (
        <div className="text-sm text-gray-500 italic py-2">
          This activation function has no editable parameters.
        </div>
      );
    }
    
    // Default case
    return (
      <div className="text-sm text-gray-500 italic py-2">
        No editable parameters available for this component.
      </div>
    );
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