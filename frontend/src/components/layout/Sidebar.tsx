import React from 'react';

const componentsList = [
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
    id: 'relu',
    name: 'ReLU Activation',
    category: 'Activations',
    description: 'Rectified Linear Unit',
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
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-move transition-colors"
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
      </div>
    </div>
  );
};

export default Sidebar;