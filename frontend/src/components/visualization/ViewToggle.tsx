'use client';

import React from 'react';
import { useStore } from '../../store/useStore';

export type ViewMode = 'blocks' | 'layers' | 'neurons' | 'testResults' | 'codeVisualizer';

const ViewToggle: React.FC = () => {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => setViewMode('blocks')}
        className={`px-4 py-2 rounded ${
          viewMode === 'blocks'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Blocks
      </button>
      <button
        onClick={() => setViewMode('layers')}
        className={`px-4 py-2 rounded ${
          viewMode === 'layers'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Layers
      </button>
      <button
        onClick={() => setViewMode('neurons')}
        className={`px-4 py-2 rounded ${
          viewMode === 'neurons'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Neurons
      </button>
      <button
        onClick={() => setViewMode('testResults')}
        className={`px-4 py-2 rounded ${
          viewMode === 'testResults'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Test Results
      </button>
      <button
        onClick={() => setViewMode('codeVisualizer')}
        className={`px-4 py-2 rounded ${
          viewMode === 'codeVisualizer'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Code Visualizer
      </button>
    </div>
  );
};

export default ViewToggle;