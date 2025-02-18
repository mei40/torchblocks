import type React from "react"

interface NodeParameters {
  [key: string]: string | number | boolean;
}

interface NodeConnections {
  input: string[];
  output: string[];
}

interface NodeData {
  label: string;
  type?: string;
  parameters?: NodeParameters;
  connections?: NodeConnections;
  transformation?: string;
}

interface ElementWiseSchematicProps {
  nodeId: string | null;
  nodeData: NodeData;
}

const ElementWiseSchematic: React.FC<ElementWiseSchematicProps> = ({ nodeId, nodeData }) => {
  if (!nodeId || !nodeData) {
    return <div>Select a node to view details</div>
  }

  return (
    <div className="element-wise-schematic">
      <h3>Node Details: {nodeData.label}</h3>
      <p>ID: {nodeId}</p>
      <p>Type: {nodeData.type || "Standard"}</p>
      {nodeData.parameters && (
        <div>
          <h4>Parameters:</h4>
          <ul>
            {Object.entries(nodeData.parameters).map(([key, value]) => (
              <li key={key}>
                {key}: {String(value)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {nodeData.connections && (
        <div>
          <h4>Connections:</h4>
          <p>Input: {nodeData.connections.input.join(", ")}</p>
          <p>Output: {nodeData.connections.output.join(", ")}</p>
        </div>
      )}
      {nodeData.transformation && (
        <div>
          <h4>Transformation:</h4>
          <p>{nodeData.transformation}</p>
        </div>
      )}
    </div>
  )
}

export default ElementWiseSchematic

