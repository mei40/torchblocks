import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  epoch: number;
  loss: number;
  accuracy: number;
}

// Mock data - replace this with your actual test results data
const mockData = Array.from({ length: 20 }, (_, i) => ({
  epoch: i + 1,
  loss: Math.exp(-i * 0.2) * (1 + Math.random() * 0.2),
  accuracy: (1 - Math.exp(-i * 0.15)) * (0.95 + Math.random() * 0.05)
}));

const TestResultsView: React.FC = () => {
  const [data] = useState(mockData);

  return (
    <div className="min-h-screen w-full bg-white p-6 overflow-auto">
      <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Loss Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Training Loss</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="epoch" 
                  label={{ 
                    value: 'Epochs', 
                    position: 'insideBottom', 
                    offset: -5 
                  }}
                />
                <YAxis
                  label={{
                    value: 'Loss',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Model Accuracy</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="epoch" 
                  label={{ 
                    value: 'Epochs', 
                    position: 'insideBottom', 
                    offset: -5 
                  }}
                />
                <YAxis
                  label={{
                    value: 'Accuracy',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Final Accuracy</h4>
          <p className="text-2xl font-bold text-blue-800">
            {(data[data.length - 1].accuracy * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-700 mb-2">Final Loss</h4>
          <p className="text-2xl font-bold text-red-800">
            {data[data.length - 1].loss.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestResultsView; 