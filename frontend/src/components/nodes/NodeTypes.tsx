import React from 'react';
import { Handle, Position } from 'reactflow';

// Linear Layer Node Component
export function LinearNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Linear Layer</div>
      <div className="text-xs">in: {data.in_features || '?'}</div>
      <div className="text-xs">out: {data.out_features || '?'}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Conv2D Layer Node Component
export function Conv2DNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Conv2D Layer</div>
      <div className="text-xs">channels: {data.channels || '?'}</div>
      <div className="text-xs">kernel: {data.kernel_size || '?'}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// ReLU Activation Node Component
export function ReluNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">ReLU</div>
      <div className="text-xs">Activation Function</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Input Node Component
export function InputNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-gray-100`}>
      <div className="font-bold text-center">Input</div>
      <div className="text-xs">features: {data.features || '?'}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Output Node Component
export function OutputNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-green-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Output</div>
      <div className="text-xs">neurons: {data.neurons || '?'}</div>
    </div>
  );
}

// Node types mapping for ReactFlow
export const nodeTypes = {
  linear: LinearNode,
  conv2d: Conv2DNode,
  relu: ReluNode,
  input: InputNode,
  output: OutputNode,
};
