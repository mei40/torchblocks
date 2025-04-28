// src/components/layout/MainCanvas.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Trash2, XCircle } from 'lucide-react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  NodeDragHandler,
  ConnectionLineType,
  EdgeMouseHandler,
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../../store/useStore';
import ViewToggle from '../visualization/ViewToggle';
import NetworkVisualization from '../visualization/NetworkVisualization';
import { nodeTypes } from '../nodes/NodeTypes';
import CodeVisualizer from '../visualization/CodeVisualizer';

// Custom edge component with a much larger hit area and better click detection
const CustomEdge = ({ 
  id, 
  source, 
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  selected,
  markerEnd,
  data
}: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  
  const onMouseDown = (evt: React.MouseEvent) => {
    setClickStartTime(Date.now());
  };
  
  const onMouseUp = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    // If mouse up within 200ms of mouse down, consider it a click
    if (Date.now() - clickStartTime < 200) {
      if (data && data.onSelect) {
        data.onSelect(id);
      }
    }
    setClickStartTime(0);
  };

  const onDeleteClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (data && data.onDelete) {
      data.onDelete(id);
    }
  };

  // Calculate the midpoint of the edge for placing the delete button
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  // Calculate the path
  const path = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`;

  return (
    <>
      {/* Invisible wider path for better click detection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="30"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Visible path */}
      <path
        id={id}
        className={`react-flow__edge-path ${selected ? 'selected' : ''}`}
        d={path}
        style={{ 
          ...style,
          stroke: selected ? '#ff0000' : isHovered ? '#0000ff' : style.stroke,
          strokeWidth: selected || isHovered ? 3 : style.strokeWidth,
        }}
        markerEnd={markerEnd}
      />
      
      {/* Delete button that appears near the connection when selected */}
      {selected && (
        <foreignObject
          width={120}
          height={40}
          x={midX - 60}
          y={midY - 25}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              background: 'rgba(255, 235, 235, 0.95)',
              padding: '5px',
              borderRadius: '6px',
              border: '1px solid #ff0000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={onDeleteClick}
              style={{
                background: 'rgba(255, 0, 0, 0.1)',
                color: '#ff0000',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <XCircle size={14} style={{ marginRight: '4px' }} />
              Delete Connection
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
};

// Custom edge types
const edgeTypes = {
  custom: CustomEdge,
};

// Custom edge options
const edgeOptions = {
  type: 'custom',
  animated: true,
  style: { stroke: '#555', strokeWidth: 2 },
};

interface MainCanvasProps {
  onNodeSelect: (node: Node | null) => void;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({ onNodeSelect }) => {
  const { viewMode, blocks, connections, addBlock, updateBlock, addConnection, removeConnection } = useStore(state => ({
    viewMode: state.viewMode,
    blocks: state.blocks,
    connections: state.connections,
    addBlock: state.addBlock,
    updateBlock: state.updateBlock,
    addConnection: state.addConnection,
    removeConnection: state.removeConnection
  }));
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);
  const draggedNode = useRef<Node | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Custom node changes handler to sync position changes to Zustand store
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // First, apply changes to the ReactFlow nodes state
    onNodesChange(changes);
    
    // Then update positions in Zustand store for any position changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position && change.id) {
        // Update the block position in the Zustand store
        updateBlock(change.id, {
          position: change.position
        });
      }
    });
  }, [onNodesChange, updateBlock]);

  // Helper function to validate connections
  const validateConnection = (connection: Connection): boolean => {
    // Prevent connecting a node to itself
    if (connection.source === connection.target) {
      setConnectionError("Cannot connect a node to itself");
      return false;
    }
    
    // Prevent multiple connections to the same target
    const targetHasConnection = edges.some(
      edge => edge.target === connection.target && edge.targetHandle === connection.targetHandle
    );
    
    if (targetHasConnection) {
      setConnectionError("Target already has a connection");
      return false;
    }
    
    // Get the source and target nodes
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      setConnectionError("Invalid nodes");
      return false;
    }
    
    // Clear error on valid connection
    setConnectionError(null);
    return true;
  };

  // Add node selection handler
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (isDragging) return; // Ignore clicks if we're dragging
    
    onNodeSelect(node);
    setSelectedEdgeId(null);
    
    // Update the Zustand store with the selected block
    const block = {
      id: node.id,
      type: node.type || 'default',
      position: node.position,
      data: node.data
    };
    
    useStore.getState().setSelectedBlock(block);
  };

  const handlePaneClick = () => {
    onNodeSelect(null);
    setSelectedEdgeId(null);
    useStore.getState().setSelectedBlock(null);
  };

  // Function to handle edge selection
  const handleEdgeSelect = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    onNodeSelect(null);
    useStore.getState().setSelectedBlock(null);
  }, [onNodeSelect]);

  // Function to handle edge deletion
  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    removeConnection(edgeId);
    setSelectedEdgeId(null);
  }, [setEdges, removeConnection]);

  // Function to handle edge clicks
  const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    onNodeSelect(null);
    useStore.getState().setSelectedBlock(null);
  }, [onNodeSelect]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!validateConnection(connection)) {
        return;
      }

      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        ...edgeOptions,
        data: { 
          onSelect: handleEdgeSelect,
          onDelete: handleEdgeDelete
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Update the Zustand store with the new connection
      addConnection({
        id: newEdge.id,
        source: connection.source || '',
        target: connection.target || '',
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined
      });
      
      // Update the nodes to reflect connection status
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (sourceNode && targetNode) {
        // Example: Update a node's data to reflect it's connected
        updateBlock(sourceNode.id, {
          data: {
            ...sourceNode.data,
            hasOutgoingConnection: true
          }
        });
        
        updateBlock(targetNode.id, {
          data: {
            ...targetNode.data,
            hasIncomingConnection: true
          }
        });
      }
    },
    [nodes, edges, setEdges, addConnection, updateBlock, handleEdgeSelect, handleEdgeDelete]
  );

  // Handle edge removal via deletion
  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach(edge => {
      removeConnection(edge.id);
    });
    setSelectedEdgeId(null);
  }, [removeConnection]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
  
      if (!reactFlowInstance) return;
  
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
  
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
  
      // Create a new node with parameters based on type
      let nodeData: any = { label: `${type} node` };
      
      // Handle Special blocks with embedded components
      if (type === 'input') {
        // Input node now has embedded dataset with shape information
        const isDatasetMnist = true; // Default to MNIST
        nodeData = {
          label: 'Input',
          dataset: {
            type: 'mnist',
            parameters: {},
            // Add shape information
            shape: {
              channels: 1,
              height: 28,
              width: 28
            }
          },
          parameters: {}
        };
      } 
      else if (type === 'output') {
        // Output node now has embedded loss function and optimizer
        nodeData = {
          label: 'Output',
          lossFunction: {
            type: 'crossentropyloss',
            parameters: {}
          },
          optimizer: {
            type: 'adam',
            parameters: {
              learning_rate: 0.001
            }
          },
          parameters: {}
        };
      } 
      
      // Handle Layer blocks
      else if (type === 'linear') {
        nodeData = {
          label: 'Linear Layer',
          parameters: {
            in_features: 784,
            out_features: 10,
          }
        };
      } 
      else if (type === 'conv2d') {
        nodeData = {
          label: 'Conv2D Layer',
          parameters: {
            in_channels: 3,
            out_channels: 64,
            kernel_size: 3,
            stride: 1,
            padding: 0
          }
        };
      } 
      else if (type === 'view') {
        nodeData = {
          label: 'View Layer',
          parameters: {
            out_shape: '784'
          },
          transformation: 'Reshape tensor'
        };
      } 
      else if (type === 'max_pool2d') {
        nodeData = {
          label: 'MaxPool2D Layer',
          parameters: {
            kernel_size: 2,
            stride: 2,
            padding: 0
          },
          transformation: 'Pooling operation'
        };
      }
      
      // Handle Activation blocks
      else if (type === 'relu') {
        nodeData = {
          label: 'ReLU Activation',
          parameters: {},
          transformation: 'max(0, x)'
        };
      } 
      else if (type === 'sigmoid') {
        nodeData = {
          label: 'Sigmoid Activation',
          parameters: {},
          transformation: '1 / (1 + exp(-x))'
        };
      } 
      else if (type === 'tanh') {
        nodeData = {
          label: 'Tanh Activation',
          parameters: {},
          transformation: 'tanh(x)'
        };
      } 
      else if (type === 'log_softmax') {
        nodeData = {
          label: 'LogSoftmax Activation',
          parameters: {},
          transformation: 'log(softmax(x))'
        };
      }
  
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };
  
      setNodes((nds) => nds.concat(newNode));
      
      // Update the Zustand store with the new block
      addBlock({
        id: newNode.id,
        type: newNode.type,
        position: newNode.position,
        data: newNode.data
      });
    },
    [reactFlowInstance, setNodes, addBlock]
  );
  
  // Track drag and drop state
  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  // Handle node drag start
  const onNodeDragStart: NodeDragHandler = useCallback((event, node) => {
    setIsDragging(true);
    draggedNode.current = node;
  }, []);

  // Handle node drag
  const onNodeDrag: NodeDragHandler = useCallback((event, node) => {
    if (!draggedNode.current) return;

    const trashButton = document.querySelector('.trash-button');
    if (trashButton) {
      const trashBounds = trashButton.getBoundingClientRect();
      const isOverTrash = (
        event.clientX >= trashBounds.left &&
        event.clientX <= trashBounds.right &&
        event.clientY >= trashBounds.top &&
        event.clientY <= trashBounds.bottom
      );

      setIsTrashActive(isOverTrash);
    }
  }, []);

  // Handle node drag end
  const onNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    setTimeout(() => setIsDragging(false), 100);
    
    if (!draggedNode.current) return;

    const trashButton = document.querySelector('.trash-button');
    if (trashButton) {
      const trashBounds = trashButton.getBoundingClientRect();
      const isOverTrash = (
        event.clientX >= trashBounds.left &&
        event.clientX <= trashBounds.right &&
        event.clientY >= trashBounds.top &&
        event.clientY <= trashBounds.bottom
      );

      if (isOverTrash) {
        // Remove the node
        setNodes((nodes) => nodes.filter((n) => n.id !== node.id));
        
        // Find all connected edges
        const edgesToRemove = edges.filter(
          (edge) => edge.source === node.id || edge.target === node.id
        );
        
        // Remove connected edges
        setEdges((edges) => edges.filter(
          (edge) => edge.source !== node.id && edge.target !== node.id
        ));
        
        // Update the Zustand store by removing the block
        useStore.getState().removeBlock(node.id);
        
        // Update the Zustand store by removing connections
        edgesToRemove.forEach(edge => {
          useStore.getState().removeConnection(edge.id);
        });
      } else {
        // If not dropped on trash, update the position in the store
        updateBlock(node.id, {
          position: node.position
        });
      }
    }

    setIsTrashActive(false);
    draggedNode.current = null;
  }, [setNodes, setEdges, edges, updateBlock]);

  // Key press handler for deleting selected edges with the Delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedEdgeId) {
        handleEdgeDelete(selectedEdgeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdgeId, handleEdgeDelete]);

  // Sync from zustand to ReactFlow whenever blocks change
  useEffect(() => {
    // Convert blocks to ReactFlow nodes, preserving positions
    const reactFlowNodes = blocks.map(block => ({
      id: block.id,
      type: block.type,
      position: block.position,
      data: block.data
    }));
    
    // Use setNodes directly to avoid triggering the onNodesChange handler
    setNodes(reactFlowNodes);
  }, [blocks, setNodes]);

  // Sync from zustand to ReactFlow whenever connections change
  useEffect(() => {
    // Convert connections to ReactFlow edges
    const reactFlowEdges = connections.map(connection => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      ...edgeOptions,
      data: { 
        onSelect: handleEdgeSelect,
        onDelete: handleEdgeDelete 
      }
    }));
    
    setEdges(reactFlowEdges);
  }, [connections, setEdges, handleEdgeDelete, handleEdgeSelect]);

  // Update existing edges with the delete handler when it changes
  useEffect(() => {
    setEdges((eds) => 
      eds.map(edge => ({
        ...edge,
        data: { 
          ...edge.data, 
          onSelect: handleEdgeSelect,
          onDelete: handleEdgeDelete 
        }
      }))
    );
  }, [handleEdgeDelete, handleEdgeSelect, setEdges]);

  // Set selected state on edges
  useEffect(() => {
    setEdges(eds => 
      eds.map(edge => ({
        ...edge,
        selected: edge.id === selectedEdgeId
      }))
    );
  }, [selectedEdgeId, setEdges]);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col" ref={reactFlowWrapper}>
      {/* View Toggle */}
      <div className="p-2 border-b">
        <ViewToggle />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 relative">
        {viewMode === 'blocks' ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={handleNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={edgeOptions}
            fitView
            className="bg-gray-50"
          >
            <Background gap={12} size={1} />
            
            {/* Controls will remain in their default position (bottom left) */}
            
            {/* Position MiniMap at the bottom-right */}
            <Panel position="bottom-right">
              <MiniMap 
                nodeStrokeWidth={3}
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'input': return '#e2e8f0';
                    case 'output': return '#86efac';
                    case 'relu': return '#fef9c3';
                    case 'conv2d': return '#bfdbfe';
                    case 'linear': return '#ddd6fe';
                    default: return '#ffffff';
                  }
                }}
              />
            </Panel>
            
            {/* Connection Error Display */}
            {connectionError && (
              <Panel position="top-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
                  {connectionError}
                </div>
              </Panel>
            )}
            
            {/* Help text moved to the top-center */}
            <Panel position="top-center" className="mt-2">
              <div className="bg-white p-2 rounded-md shadow-sm text-sm">
                <ul className="list-disc pl-4 space-y-1">
                  <li className="text-blue-600">Drag components from the sidebar to start building</li>
                  <li className="text-orange-600">Connect nodes by dragging from output to input handles</li>
                  <li className="text-red-600">Drag components to the trash to delete them</li>
                </ul>
              </div>
            </Panel>

            {/* Trash can button positioned to the right of the controls at bottom-left */}
            <Panel position="bottom-left" className="ml-32">
              <div 
                className={`trash-button p-4 rounded-full transition-colors duration-200 shadow-md mb-2 ${
                  isTrashActive ? 'bg-red-100' : 'bg-white'
                }`}
              >
                <Trash2 
                  className={`transition-colors duration-200 ${
                    isTrashActive ? 'text-red-600' : 'text-gray-400'
                  }`} 
                  size={24} 
                />
              </div>
            </Panel>
          </ReactFlow>
        ) : viewMode === 'layers' ? (
          <div className="w-full h-full overflow-auto p-4">
            <NetworkVisualization />
          </div>
        ) : viewMode === 'neurons' ? (
          <div className="w-full h-full overflow-auto p-4">
            <NetworkVisualization />
          </div>
        ) : viewMode === 'testResults' ? (
          <div className="w-full h-full overflow-auto p-4">
            <NetworkVisualization />
          </div>
        ) : viewMode === 'codeVisualizer' ? (
          <CodeVisualizer />
        ) : null}
      </div>
    </div>
  );
};

export default MainCanvas;