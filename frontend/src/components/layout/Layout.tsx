'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainCanvas } from './MainCanvas';
import { PropertyPanel } from '../graph/PropertyPanel';
import { useStore } from '../../store/useStore';
import type { Node } from 'reactflow';

export const Layout = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const viewMode = useStore(state => state.viewMode);

  const handleNodeSelect = (node: Node | null) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar in blocks view */}
        {viewMode === 'blocks' && <Sidebar />}
        
        <div className="flex-1 relative">
          <MainCanvas onNodeSelect={handleNodeSelect} />
        </div>
        
        {/* Only show property panel in blocks view when a node is selected */}
        {viewMode === 'blocks' && <PropertyPanel selectedNode={selectedNode} />}
      </div>
    </div>
  );
};

export default Layout;
