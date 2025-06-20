import React from 'react';

const componentsList = [
  // Special blocks
  {
    id: 'input',
    name: 'Input Block',
    category: 'Special',
    description: 'Input with dataset',
  },
  {
    id: 'output',
    name: 'Output Block',
    category: 'Special',
    description: 'Output with loss and optimizer',
  },
  
  // Layer blocks
  {
    id: 'linear',
    name: 'Linear Layer',
    category: 'Layers',
    description: 'Fully connected layer',
  },
  {
    id: 'conv2d',
    name: 'Conv2D Layer',
    category: 'Layers',
    description: 'Convolutional layer',
  },
  {
    id: 'view',
    name: 'View',
    category: 'Layers',
    description: 'Reshape tensor',
  },
  {
    id: 'max_pool2d',
    name: 'MaxPool2D',
    category: 'Layers',
    description: 'Max pooling operation',
  },
  
  // Activation blocks
  {
    id: 'relu',
    name: 'ReLU',
    category: 'Activations',
    description: 'Rectified Linear Unit',
  },
  {
    id: 'sigmoid',
    name: 'Sigmoid',
    category: 'Activations',
    description: 'Sigmoid function',
  },
  {
    id: 'tanh',
    name: 'Tanh',
    category: 'Activations',
    description: 'Hyperbolic tangent',
  },
  {
    id: 'log_softmax',
    name: 'LogSoftmax',
    category: 'Activations',
    description: 'Log of softmax function',
  },
];

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        
        {/* Group components by category */}
        {Object.entries(
          componentsList.reduce((acc, component) => {
            if (!acc[component.category]) {
              acc[component.category] = [];
            }
            acc[component.category].push(component);
            return acc;
          }, {} as Record<string, typeof componentsList>)
        ).map(([category, components]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{category}</h3>
            <div className="space-y-2">
              {components.map((component) => (
                <div
                  key={component.id}
                  className={`p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-move transition-colors ${
                    component.id === 'input' ? 'bg-gray-100' : 
                    component.id === 'output' ? 'bg-green-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => onDragStart(e, component.id)}
                >
                  <div className="font-medium text-sm">{component.name}</div>
                  <div className="text-xs text-gray-500">
                    {component.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-3 border border-gray-200 rounded-md bg-blue-50">
          <h3 className="text-sm font-medium">How to use</h3>
          <ol className="text-xs text-gray-600 list-decimal pl-4 mt-2 space-y-1">
            <li>Drag components onto the canvas</li>
            <li>Connect outputs to inputs</li>
            <li>Switch views to see your model architecture</li>
            <li>Export your model to PyTorch code</li>
          </ol>
        </div>
        
        <div className="mt-4 p-3 border border-gray-200 rounded-md bg-yellow-50">
          <h3 className="text-sm font-medium">Block Configuration</h3>
          <ul className="text-xs text-gray-600 list-disc pl-4 mt-2 space-y-1">
            <li>Input Block: Contains a dataset (MNIST or CIFAR10)</li>
            <li>Output Block: Contains loss function and optimizer</li>
            <li>Select blocks to configure parameters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;