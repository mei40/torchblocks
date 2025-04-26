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
  const outChannels = data.out_channels ?? data.parameters?.out_channels ?? 64;
  const kernelSize = data.kernel_size ?? data.parameters?.kernel_size ?? 3;
  const stride = data.stride ?? data.parameters?.stride ?? 1;
  const padding = data.padding ?? data.parameters?.padding ?? 0;
  
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
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">LogSoftmax</div>
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
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-orange-100`} style={{ minWidth: '150px' }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center text-sm">CrossEntropyLoss</div>
    </div>
  );
}

export function MSELossNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-orange-100`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">MSELoss</div>
    </div>
  );
}

// Optimizer Node Components
export function AdamNode({ data, selected }: { data: any; selected?: boolean }) {
  const lr = data.learning_rate ?? data.parameters?.learning_rate ?? 0.001;
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-yellow-100`}>
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
      <div className="font-bold text-center">SGD</div>
      <div className="text-xs">lr: {lr}</div>
      <div className="text-xs">momentum: {momentum}</div>
    </div>
  );
}

// Dataset Node Components
export function MNISTNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-purple-100`}>
      <div className="font-bold text-center">MNIST</div>
      <div className="text-xs">shape: (1, 28, 28)</div>
    </div>
  );
}

export function CIFAR10Node({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-purple-100`}>
      <div className="font-bold text-center">CIFAR10</div>
      <div className="text-xs">shape: (3, 32, 32)</div>
    </div>
  );
}

// Special Node Components
export function InputNode({ data, selected }: { data: any; selected?: boolean }) {
  // Dataset is now embedded within the input node
  const datasetType = data.dataset?.type || 'mnist';
  
  // Get custom shape if available, otherwise use default shape based on dataset type
  const channels = data.dataset?.shape?.channels || (datasetType === 'mnist' ? 1 : 3);
  const height = data.dataset?.shape?.height || (datasetType === 'mnist' ? 28 : 32);
  const width = data.dataset?.shape?.width || (datasetType === 'mnist' ? 28 : 32);
  
  // Create the shape string
  const datasetShape = `(${channels}, ${height}, ${width})`;
  
  // Determine if custom shape is used
  const isCustomShape = 
    (datasetType === 'mnist' && (channels !== 1 || height !== 28 || width !== 28)) ||
    (datasetType === 'cifar10' && (channels !== 3 || height !== 32 || width !== 32));
  
  return (
    <div className={`px-2 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-gray-100 w-auto`}>
      <div className="font-bold text-center">Input</div>
      
      {/* Embedded dataset component */}
      <div className="mt-2 p-2 bg-purple-100 rounded-md border border-purple-200 mx-auto" style={{ maxWidth: '140px' }}>
        <div className="font-medium text-center text-sm">{datasetType === 'mnist' ? 'MNIST' : 'CIFAR10'}</div>
        <div className="text-xs text-center">
          shape: {datasetShape}
          {isCustomShape && <span className="ml-1 text-purple-700">*</span>}
        </div>
        {isCustomShape && (
          <div className="text-xs text-center text-purple-700 mt-1">* Custom Shape</div>
        )}
      </div>
      
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
  // Loss function and optimizer are now embedded within the output node
  const lossType = data.lossFunction?.type || 'crossentropyloss';
  const optimizerType = data.optimizer?.type || 'adam';
  const lr = data.optimizer?.parameters?.learning_rate || 0.001;
  const momentum = optimizerType === 'sgd' ? (data.optimizer?.parameters?.momentum || 0) : null;
  
  return (
    <div className={`px-2 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} bg-green-100 w-auto`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Output</div>
      
      {/* Embedded loss function component */}
      <div className="mt-2 p-2 bg-orange-100 rounded-md border border-orange-200 mx-auto" style={{ maxWidth: '140px' }}>
        <div className="font-medium text-center text-sm">
          {lossType === 'crossentropyloss' ? 'CrossEntroLoss' : 'MSELoss'}
        </div>
      </div>
      
      {/* Embedded optimizer component */}
      <div className="mt-2 p-2 bg-yellow-100 rounded-md border border-yellow-200 mx-auto" style={{ maxWidth: '140px' }}>
        <div className="font-medium text-center text-sm">
          {optimizerType === 'adam' ? 'Adam' : 'SGD'}
        </div>
        <div className="text-xs text-center">lr: {lr}</div>
        {momentum !== null && (
          <div className="text-xs text-center">momentum: {momentum}</div>
        )}
      </div>
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
  cifar10: CIFAR10Node,
  input: InputNode,
  output: OutputNode,
  view: ViewNode,
  max_pool2d: MaxPool2DNode,
};