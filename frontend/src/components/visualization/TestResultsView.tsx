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
import { ResultsData } from '../../../electron.d';

interface DataPoint {
  epoch: number;
  loss: number;
  accuracy: number;
}

const TestResultsView: React.FC = () => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setStatusMessage('Initializing...');

      try {
        let results: ResultsData | null = null;
        let success = false;
        let fetchError: string | undefined = undefined;

        if (window.electronAPI) {
          setStatusMessage('Fetching results via Electron API...');
          const ipcResult = await window.electronAPI.getTestResults();
          success = ipcResult.success;
          results = ipcResult.data;
          fetchError = ipcResult.error;
          if (!success) {
            throw new Error(fetchError || 'Failed to get test results via IPC');
          }
        } else {
          setStatusMessage('Fetching results via HTTP API...');
          const response = await fetch('/api/get-test-results');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          results = await response.json() as ResultsData;
          success = true;
        }

        if (success && results) {
          const processedData: DataPoint[] = results.losses.map((lossPoint: [number, number], index: number) => {
            const accuracyPoint = results.accuracies[index] || [lossPoint[0], 0];
            return {
              epoch: parseFloat(lossPoint[0].toFixed(2)),
              loss: lossPoint[1],
              accuracy: accuracyPoint[1],
            };
          });
          setChartData(processedData);
          setStatusMessage('Results loaded.');
        } else if (!success && fetchError) {
          throw new Error(fetchError);
        }

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load test results';
        setError(errorMessage);
        setStatusMessage(`Error: ${errorMessage}`);
        console.error('Fetch error:', e);
      }
      setIsLoading(false);
    };

    fetchData();

    if (window.electronAPI && window.electronAPI.onTestResultsStatus) {
      window.electronAPI.onTestResultsStatus(setStatusMessage);
    }

  }, []);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center"><p className="text-gray-500">{statusMessage || 'Loading test results...'}</p></div>;
  }

  if (error) {
    return <div className="w-full h-full flex items-center justify-center bg-red-50"><p className="text-red-600">Error: {error}</p></div>;
  }

  if (chartData.length === 0) {
    return <div className="w-full h-full flex items-center justify-center"><p className="text-gray-500">No test result data available.</p></div>;
  }

  const finalDataPoint = chartData[chartData.length - 1];

  return (
    <div className="w-full h-full relative" style={{ overflow: 'hidden' }}>
      <div style={{ 
        transform: 'scale(1)', 
        transformOrigin: 'top left',
        width: '100%', 
        height: '100%'
      }}>
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2 text-gray-700">Training Loss</h3>
              <div className="h-[200px]">
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
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2 text-gray-700">Model Accuracy</h3>
              <div className="h-[200px]">
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
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 mb-1">Final Accuracy</h4>
              <p className="text-2xl font-bold text-blue-800">
                {(finalDataPoint.accuracy * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-red-700 mb-1">Final Loss</h4>
              <p className="text-2xl font-bold text-red-800">
                {finalDataPoint.loss.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsView;