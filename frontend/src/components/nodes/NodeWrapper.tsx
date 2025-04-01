import React, { useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

// This wrapper will take any node component and make sure it updates
// even when the reactivity system fails
export const LinearNodeWrapper = ({ data, selected }: { data: any; selected?: boolean }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const inFeaturesRef = useRef<HTMLDivElement>(null);
  const outFeaturesRef = useRef<HTMLDivElement>(null);
  
  // Force update the DOM when data changes
  useEffect(() => {
    if (inFeaturesRef.current) {
      inFeaturesRef.current.textContent = `in: ${data.in_features || data.parameters?.in_features || '?'}`;
    }
    if (outFeaturesRef.current) {
      outFeaturesRef.current.textContent = `out: ${data.out_features || data.parameters?.out_features || '?'}`;
    }
  }, [data, data.in_features, data.out_features, data.parameters]);

  return (
    <div 
      ref={nodeRef}
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="input"
      />
      <div className="font-bold text-center">Linear Layer</div>
      <div ref={inFeaturesRef} className="text-xs">in: {data.in_features || data.parameters?.in_features || '?'}</div>
      <div ref={outFeaturesRef} className="text-xs">out: {data.out_features || data.parameters?.out_features || '?'}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
        id="output"
      />
    </div>
  );
};