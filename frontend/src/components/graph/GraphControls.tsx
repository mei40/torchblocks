import type React from "react"
import { useStoreApi, useReactFlow, type Node } from "reactflow"

const GraphControls: React.FC = () => {
  const store = useStoreApi()
  const { zoomIn, zoomOut, setCenter } = useReactFlow()

  const focusNode = (nodeId: string) => {
    const { nodeInternals } = store.getState()
    const node = nodeInternals.get(nodeId)

    if (node) {
      const x = node.position.x + (node.width ?? 100) / 2
      const y = node.position.y + (node.height ?? 50) / 2
      const zoom = 1.85

      setCenter(x, y, { zoom, duration: 1000 })
    }
  }

  return (
    <div className="graph-controls">
      <button onClick={() => zoomIn()}>Zoom In</button>
      <button onClick={() => zoomOut()}>Zoom Out</button>
      <button onClick={() => focusNode("1")}>Focus Input Layer</button>
      <button onClick={() => focusNode("output")}>Focus Output Layer</button>
    </div>
  )
}

export default GraphControls

