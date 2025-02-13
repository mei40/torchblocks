'use client';

import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input' },
    position: { x: 250, y: 25 },
  },
];

export const MainCanvas = () => {
  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={[]}
        className="bg-gray-50"
        fitView
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap />
        <Panel position="bottom-right">
          <div className="bg-white p-2 rounded-md shadow-sm text-sm">
            Drag components from the sidebar to start building
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

