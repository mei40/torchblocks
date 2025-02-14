'use client';

import React from 'react';

export const PropertyPanel = () => {
  return (
    <div className="w-64 border-l border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        <div className="text-sm text-gray-500">
          Select a component to view its properties, once component clicked, this panel will show all configurable parameters for the specific nueral network layer.
        </div>
      </div>
    </div>
  );
};

