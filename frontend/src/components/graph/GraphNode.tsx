import type React from "react"
import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

const GraphNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`neural-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default memo(GraphNode)

