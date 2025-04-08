'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, BookOpen, Code, ChevronRight } from 'lucide-react';

// Define types for library documentation
interface BaseLibraryDoc {
  name: string;
  description: string;
  link: string;
}

interface TorchDoc extends BaseLibraryDoc {
  imports: string[];
  commonUses: string[];
}

interface NNDoc extends BaseLibraryDoc {
  commonClasses: string[];
}

interface FDoc extends BaseLibraryDoc {
  commonFunctions: string[];
}

type LibraryDoc = TorchDoc | NNDoc | FDoc;

// Library documentation data
const libraryDocs: Record<string, LibraryDoc> = {
  torch: {
    name: 'PyTorch',
    description: 'An open source machine learning framework that accelerates the path from research prototyping to production deployment.',
    link: 'https://pytorch.org/docs/stable/index.html',
    imports: ['torch', 'torch.nn', 'torch.nn.functional'],
    commonUses: ['Neural Networks', 'Tensors', 'Autograd', 'Optimization']
  },
  nn: {
    name: 'torch.nn',
    description: 'A neural networks library deeply integrated with autograd designed for maximum flexibility.',
    link: 'https://pytorch.org/docs/stable/nn.html',
    commonClasses: ['Module', 'Linear', 'Conv2d', 'Dropout']
  },
  F: {
    name: 'torch.nn.functional',
    description: 'A functional interface to the neural network modules.',
    link: 'https://pytorch.org/docs/stable/nn.functional.html',
    commonFunctions: ['relu', 'max_pool2d', 'log_softmax']
  }
};

// Sample Python code for demonstration
const sampleCode = `import torch
import torch.nn as nn
import torch.nn.functional as F

class NeuralNetwork(nn.Module):
    def __init__(self):
        super(NeuralNetwork, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, 1)
        self.conv2 = nn.Conv2d(32, 64, 3, 1)
        self.dropout1 = nn.Dropout(0.25)
        self.dropout2 = nn.Dropout(0.5)
        self.fc1 = nn.Linear(9216, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.conv1(x)
        x = F.relu(x)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)
        x = self.dropout1(x)
        x = torch.flatten(x, 1)
        x = self.fc1(x)
        x = F.relu(x)
        x = self.dropout2(x)
        x = self.fc2(x)
        output = F.log_softmax(x, dim=1)
        return output`;

const CodeVisualizer: React.FC = () => {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{
    type: 'library' | 'class' | 'function';
    name: string;
    line: number;
  } | null>(null);

  const handleLineHover = (lineNumber: number) => {
    setHoveredLine(lineNumber);
  };

  const handleLineLeave = () => {
    setHoveredLine(null);
  };

  const handleCodeClick = (lineNumber: number, text: string) => {
    const line = text.trim();
    if (line.startsWith('import')) {
      const lib = line.split(' ')[1].split('.')[0];
      if (libraryDocs[lib]) {
        setSelectedLibrary(lib);
        setShowDocs(true);
      }
    } else if (line.includes('class')) {
      setSelectedElement({ type: 'class', name: line.split('class ')[1].split('(')[0], line: lineNumber });
    } else if (line.includes('(') && line.includes(')')) {
      const funcName = line.split('(')[0].trim().split('.').pop();
      if (funcName) {
        setSelectedElement({ type: 'function', name: funcName, line: lineNumber });
      }
    }
  };

  const renderLibraryDocs = () => {
    if (!selectedLibrary || !showDocs) return null;
    const lib = libraryDocs[selectedLibrary];
    
    return (
      <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{lib.name}</h3>
          <button 
            onClick={() => setShowDocs(false)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <p className="text-gray-300 mb-4">{lib.description}</p>
        <a 
          href={lib.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 flex items-center mb-4"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Official Documentation
        </a>
        
        {'commonUses' in lib && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Uses</h4>
            <div className="flex flex-wrap gap-2">
              {lib.commonUses.map((use: string) => (
                <span key={use} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {'commonClasses' in lib && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Classes</h4>
            <div className="flex flex-wrap gap-2">
              {lib.commonClasses.map((cls: string) => (
                <span key={cls} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                  {cls}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {'commonFunctions' in lib && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Functions</h4>
            <div className="flex flex-wrap gap-2">
              {lib.commonFunctions.map((func: string) => (
                <span key={func} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                  {func}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderElementInfo = () => {
    if (!selectedElement) return null;
    
    return (
      <div className="absolute left-0 bottom-0 w-full bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400 text-sm">Line {selectedElement.line}:</span>
            <span className="ml-2 text-white">{selectedElement.name}</span>
          </div>
          <button 
            onClick={() => setSelectedElement(null)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="mt-2 text-gray-300 text-sm">
          {selectedElement.type === 'class' && (
            <p>This is a class definition for a neural network component.</p>
          )}
          {selectedElement.type === 'function' && (
            <p>This is a function call within the neural network's forward pass.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col ${isDarkTheme ? 'bg-gray-900' : 'bg-white'} text-white`}>
      {/* Controls Panel */}
      <div className={`p-4 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} flex items-center space-x-4`}>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Line Numbers:</label>
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Font Size:</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className={`${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} rounded px-2 py-1 text-sm`}
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Theme:</label>
          <select
            value={isDarkTheme ? 'dark' : 'light'}
            onChange={(e) => setIsDarkTheme(e.target.value === 'dark')}
            className={`${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} rounded px-2 py-1 text-sm`}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className={`ml-auto flex items-center space-x-2 ${isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} px-3 py-1 rounded text-sm`}
        >
          <Info className="w-4 h-4" />
          <span>Library Docs</span>
        </button>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-4 relative">
        <div className="relative">
          <SyntaxHighlighter
            language="python"
            style={isDarkTheme ? vscDarkPlus : vs}
            showLineNumbers={showLineNumbers}
            customStyle={{
              fontSize: `${fontSize}px`,
              backgroundColor: isDarkTheme ? '#1a1a1a' : '#f5f5f5',
              padding: '1rem',
              borderRadius: '0.5rem',
              margin: 0,
            }}
            lineProps={(lineNumber) => ({
              style: {
                display: 'block',
                backgroundColor: hoveredLine === lineNumber ? (isDarkTheme ? '#2a2a2a' : '#e5e5e5') : 'transparent',
                cursor: 'pointer',
              },
              onMouseEnter: () => handleLineHover(lineNumber),
              onMouseLeave: handleLineLeave,
              onClick: () => handleCodeClick(lineNumber, sampleCode.split('\n')[lineNumber - 1]),
            })}
          >
            {sampleCode}
          </SyntaxHighlighter>
          
          {/* Hover Info Panel */}
          {hoveredLine !== null && (
            <div className={`absolute right-4 top-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'} p-2 rounded shadow-lg text-sm`}>
              <div className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>Line {hoveredLine}</div>
              <div className={isDarkTheme ? 'text-white' : 'text-gray-900'} style={{ marginTop: '0.25rem' }}>
                {sampleCode.split('\n')[hoveredLine - 1]?.trim()}
              </div>
            </div>
          )}
        </div>
        {renderLibraryDocs()}
        {renderElementInfo()}
      </div>

      {/* Status Bar */}
      <div className={`p-2 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex justify-between">
          <span>Python</span>
          <span>{sampleCode.split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
};

export default CodeVisualizer; 