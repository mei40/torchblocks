import React from 'react';
import { Handle, Position } from 'reactflow';

// Linear Layer Node Component
export function LinearNode({ data, selected }: { data: any; selected?: boolean }) {
  // Get parameters from both possible locations and use latest
  const inFeatures = data.in_features ?? data.parameters?.in_features ?? 784;
  const outFeatures = data.out_features ?? data.parameters?.out_features ?? 128;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Linear Layer</div>
      <div className="text-xs">in: {inFeatures}</div>
      <div className="text-xs">out: {outFeatures}</div>
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
  const inChannels = data.in_channels ?? data.parameters?.in_channels ?? 3;
  const outChannels = data.channels ?? data.parameters?.out_channels ?? 64;
  const kernelSize = data.kernel_size ?? data.parameters?.kernel_size ?? 3;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Conv2D Layer</div>
      <div className="text-xs">in_ch: {inChannels}</div>
      <div className="text-xs">out_ch: {outChannels}</div>
      <div className="text-xs">k: {kernelSize}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Activation Node Components
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

export function SigmoidNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Sigmoid</div>
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

export function TanhNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Tanh</div>
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

export function LogSoftmaxNode({ data, selected }: { data: any; selected?: boolean }) {
  const dim = data.dim ?? data.parameters?.dim ?? 1;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">LogSoftmax</div>
      <div className="text-xs">dim: {dim}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Loss Function Node Components
export function CrossEntropyLossNode({ data, selected }: { data: any; selected?: boolean }) {
  const reduction = data.reduction ?? data.parameters?.reduction ?? 'mean';
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-orange-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">CrossEntropyLoss</div>
      <div className="text-xs">reduction: {reduction}</div>
    </div>
  );
}

export function MSELossNode({ data, selected }: { data: any; selected?: boolean }) {
  const reduction = data.reduction ?? data.parameters?.reduction ?? 'mean';
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-orange-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">MSELoss</div>
      <div className="text-xs">reduction: {reduction}</div>
    </div>
  );
}

// Optimizer Node Components
export function AdamNode({ data, selected }: { data: any; selected?: boolean }) {
  const lr = data.learning_rate ?? data.parameters?.learning_rate ?? 0.001;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-yellow-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Adam</div>
      <div className="text-xs">lr: {lr}</div>
    </div>
  );
}

export function SGDNode({ data, selected }: { data: any; selected?: boolean }) {
  const lr = data.learning_rate ?? data.parameters?.learning_rate ?? 0.001;
  const momentum = data.momentum ?? data.parameters?.momentum ?? 0;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-yellow-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">SGD</div>
      <div className="text-xs">lr: {lr}</div>
      <div className="text-xs">momentum: {momentum}</div>
    </div>
  );
}

// Dataset Node Component
export function MNISTNode({ data, selected }: { data: any; selected?: boolean }) {
  const batchSize = data.batch_size ?? data.parameters?.batch_size ?? 64;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-purple-100`}>
      <div className="font-bold text-center">MNIST</div>
      <div className="text-xs">batch: {batchSize}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Special Node Components
export function InputNode({ data, selected }: { data: any; selected?: boolean }) {
  const features = data.features ?? data.parameters?.features ?? 3;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-gray-100`}>
      <div className="font-bold text-center">Input</div>
      <div className="text-xs">features: {features}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

export function OutputNode({ data, selected }: { data: any; selected?: boolean }) {
  const neurons = data.neurons ?? data.parameters?.neurons ?? 1;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-green-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Output</div>
      <div className="text-xs">neurons: {neurons}</div>
    </div>
  );
}

// Other Node Components
export function ViewNode({ data, selected }: { data: any; selected?: boolean }) {
  const outShape = data.out_shape ?? data.parameters?.out_shape ?? '[batch_size, -1]';
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">View</div>
      <div className="text-xs">out_shape: {outShape}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

export function MaxPool2DNode({ data, selected }: { data: any; selected?: boolean }) {
  const kernelSize = data.kernel_size ?? data.parameters?.kernel_size ?? 2;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">MaxPool2D</div>
      <div className="text-xs">kernel: {kernelSize}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
}

// Node types mapping for ReactFlow
export const nodeTypes = {
  linear: LinearNode,
  conv2d: Conv2DNode,
  relu: ReluNode,
  sigmoid: SigmoidNode,
  tanh: TanhNode,
  log_softmax: LogSoftmaxNode,
  crossentropyloss: CrossEntropyLossNode,
  mseloss: MSELossNode,
  adam: AdamNode,
  sgd: SGDNode,
  mnist: MNISTNode,
  input: InputNode,
  output: OutputNode,
  view: ViewNode,
  max_pool2d: MaxPool2DNode,
};