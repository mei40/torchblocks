"use client"

import type React from "react"
import { useCallback } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type NodeChange,
  type Connection,
} from "reactflow"
import "reactflow/dist/style.css"

import GraphNode from "./GraphNode"
import GraphEdge from "./GraphEdge"
import GraphControls from "./GraphControls"

const nodeTypes = {
  neuralNode: GraphNode,
}

const edgeTypes = {
  neuralEdge: GraphEdge,
}

interface NetworkGraphProps {
  initialNodes: Node[]
  initialEdges: Edge[]
  onNodeSelect: (nodeId: string | null) => void
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ initialNodes, initialEdges, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)), 
    [setEdges]
  )

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(
        changes.map((change) => {
          if (change.type === "position" && change.position) {
            const node = nodes.find((n) => n.id === change.id)
            if (node) {
              const originalX = node.position.x
              return {
                ...change,
                position: {
                  x: originalX,
                  y: change.position.y,
                },
              }
            }
          }
          return change
        }),
      )
    },
    [nodes, onNodesChange],
  )

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    onNodeSelect(node.id)
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <GraphControls />
      </ReactFlow>
    </div>
  )
}

export default NetworkGraph

