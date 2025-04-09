import React, { useState, useEffect } from 'react';
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

interface ResultsData {
  losses: [number, number][];
  accuracies: [number, number][];
}

const TestResultsView: React.FC = () => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/get-test-results');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const results: ResultsData = await response.json();

        // Process data for recharts
        // Assume losses and accuracies arrays have the same length and corresponding epochs
        const processedData: DataPoint[] = results.losses.map((lossPoint, index) => {
          const accuracyPoint = results.accuracies[index] || [lossPoint[0], 0]; // Handle potential mismatch
          return {
            epoch: parseFloat(lossPoint[0].toFixed(2)), // Use epoch from loss data, format
            loss: lossPoint[1],
            accuracy: accuracyPoint[1],
          };
        });

        setChartData(processedData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load test results');
        console.error('Fetch error:', e);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading test results...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-red-50"><p className="text-red-600">Error: {error}</p></div>;
  }

  if (chartData.length === 0) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-gray-100"><p className="text-gray-500">No test result data available.</p></div>;
  }

  const finalDataPoint = chartData[chartData.length - 1];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 overflow-auto">
      <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Loss Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Training Loss</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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
                  type="number"
                  domain={['dataMin', 'dataMax']}
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
                data={chartData}
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
                  type="number"
                  domain={['dataMin', 'dataMax']}
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
            {(finalDataPoint.accuracy * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-700 mb-2">Final Loss</h4>
          <p className="text-2xl font-bold text-red-800">
            {finalDataPoint.loss.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestResultsView; 