"use client"

import type React from "react"

interface PropertyPanelProps {
  selectedNode: any
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedNode }) => {
  return (
    <div className="w-64 border-l border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        {selectedNode ? (
          <div>
            <h3 className="text-md font-medium mb-2">{selectedNode.data.label}</h3>
            <div className="text-sm">
              <p>
                <strong>Type:</strong> {selectedNode.data.type}
              </p>
              {selectedNode.data.parameters && (
                <div>
                  <p className="mt-2">
                    <strong>Parameters:</strong>
                  </p>
                  <ul className="list-disc pl-5">
                    {Object.entries(selectedNode.data.parameters).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedNode.data.transformation && (
                <p className="mt-2">
                  <strong>Transformation:</strong> {selectedNode.data.transformation}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Select a component to view its properties. Once a component is clicked, this panel will show all
            configurable parameters for the specific neural network layer.
          </div>
        )}
      </div>
    </div>
  )
}

