'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainCanvas } from './MainCanvas';
import { PropertyPanel } from './PropertyPanel';

export const Layout = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <MainCanvas />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
};

