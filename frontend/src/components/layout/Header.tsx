'use client';

import React, { useState } from 'react';

export const Header = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [logs, setLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const runTests = async () => {
    try {
      // Call backend API to execute the shell script
      const response = await fetch('/api/run-tests', {
        method: 'POST',
      });
      
      if (response.ok) {
        setShowNotification(true);
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
      } else {
        console.error('Failed to run tests');
      }
    } catch (error) {
      console.error('Error running tests:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/get-logs');
      if (response.ok) {
        const logData = await response.text();
        setLogs(logData);
        setShowLogs(true);
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white relative"> 
      <div className="h-full px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">TorchBlocks</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={runTests}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Run Test
          </button>
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Save
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Export
          </button>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-md p-4 border border-gray-200 w-80 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Test Completed</h3>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">The test has been completed successfully.</p>
          <button
            onClick={fetchLogs}
            className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Show Logs
          </button>
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-3/4 max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">Test Logs</h3>
              <button 
                onClick={() => setShowLogs(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
              <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm font-mono">
                {logs || 'No logs available.'}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowLogs(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

