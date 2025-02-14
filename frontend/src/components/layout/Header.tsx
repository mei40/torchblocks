'use client';

import React from 'react';

export const Header = () => {
  return (
    <header className="h-14 border-b border-gray-200 bg-white"> 
      <div className="h-full px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">TorchBlocks</h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Save
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Export
          </button>
        </div>
      </div> 
    </header>
  );
};

