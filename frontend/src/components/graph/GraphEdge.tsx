import type React from "react"
import { type EdgeProps, getStraightPath, Position } from "reactflow"

const GraphEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return <path id={id} style={style} className="react-flow__edge-path neural-edge" d={edgePath} markerEnd={markerEnd} />
}

export default GraphEdge

