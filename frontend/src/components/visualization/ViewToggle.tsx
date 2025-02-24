'use client';

import React from 'react';
import { useStore, ViewMode } from '../../store/useStore';

const ViewToggle: React.FC = () => {
  const { viewMode, setViewMode } = useStore(state => ({
    viewMode: state.viewMode,
    setViewMode: state.setViewMode
  }));

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="flex items-center">
      <div className="mr-2 text-sm font-medium text-gray-600">View Mode:</div>
      <div className="flex rounded-md overflow-hidden border border-gray-300">
        <button
          onClick={() => handleViewChange('blocks')}
          className={`px-4 py-1 text-sm transition-colors ${
            viewMode === 'blocks' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Blocks
        </button>
        <button
          onClick={() => handleViewChange('layers')}
          className={`px-4 py-1 text-sm transition-colors border-l border-r border-gray-300 ${
            viewMode === 'layers' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => handleViewChange('neurons')}
          className={`px-4 py-1 text-sm transition-colors ${
            viewMode === 'neurons' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Neurons
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;