'use client';

import React from 'react';

const componentsList = [
  { id: 'linear', name: 'Test Linear Layer', category: 'Layers' },
  { id: 'conv2d', name: 'Conv2D Layer', category: 'Layers' },
  { id: 'relu', name: 'ReLU Activation', category: 'Activations' }
];

export const Sidebar = () => {
  return (
    <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        <div className="space-y-4">
          {componentsList.map((component) => (
            <div
              key={component.id}
              className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-move transition-colors"
              draggable
            >
              <div className="font-medium text-sm">{component.name}</div>
              <div className="text-xs text-gray-500">{component.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
