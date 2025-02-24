import React, { useState, useCallback, useRef } from 'react';
import { Trash2 } from 'lucide-react';
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
  XYPosition,
  ReactFlowInstance,
  NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MainCanvasProps {
  onNodeSelect: (node: Node | null) => void;
}

// Custom node types
const nodeTypes = {
  linear: LinearNode,
  conv2d: Conv2DNode,
  relu: ReluNode,
};

// Custom node components
function LinearNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <div className="font-bold">Linear Layer</div>
      <div className="text-xs">in: {data.in_features || '?'}</div>
      <div className="text-xs">out: {data.out_features || '?'}</div>
    </div>
  );
}

function Conv2DNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <div className="font-bold">Conv2D Layer</div>
      <div className="text-xs">channels: {data.channels || '?'}</div>
      <div className="text-xs">kernel: {data.kernel_size || '?'}</div>
    </div>
  );
}

function ReluNode() {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <div className="font-bold">ReLU</div>
      <div className="text-xs">Activation Function</div>
    </div>
  );
}

export const MainCanvas: React.FC<MainCanvasProps> = ({ onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);
  const draggedNode = useRef<Node | null>(null);

  // Add node selection handler
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    onNodeSelect(node);
  };

  const handlePaneClick = () => {
    onNodeSelect(null);
  };

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle node drag start
  const onNodeDragStart: NodeDragHandler = useCallback((event, node) => {
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
        // Remove connected edges
        setEdges((edges) => edges.filter(
          (edge) => edge.source !== node.id && edge.target !== node.id
        ));
      }
    }

    setIsTrashActive(false);
    draggedNode.current = null;
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap />
        
        {/* Help text */}
        <Panel position="bottom-right">
          <div className="bg-white p-2 rounded-md shadow-sm text-sm">
            Drag components from the sidebar to start building
            <br />
            Drag components to the trash to delete them
          </div>
        </Panel>

        {/* Trash can button - adjust ml-16 (margin-left) to move right/left */}
        <Panel position="bottom-left">
          <div 
            className={`trash-button p-4 rounded-full transition-colors duration-200 ml-16 mb-2 ${
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
    </div>
  );
};

export default MainCanvas;