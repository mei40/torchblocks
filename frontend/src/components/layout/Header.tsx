'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { downloadNetworkJson, saveNetworkJsonToServer } from '../visualization/networkToJson';

export const Header = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [logs, setLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { blocks, connections } = useStore();

  const runTests = async () => {
    try {
      // Call backend API to execute the shell script
      const response = await fetch('/api/run-tests', {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotificationMessage('Test completed successfully');
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

  const handleExport = () => {
    downloadNetworkJson(blocks, connections, 'torchblocks_model.json');
  };
  
  const handleSave = async () => {
    const result = await saveNetworkJsonToServer(blocks, connections, 'model.json');
    setNotificationMessage(result.message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleGoogleSignIn = () => {
    // This function will be connected to Google authentication endpoint
    // For now, it's a placeholder that will be filled later
    console.log('Google sign in initiated');
    
    // replace this with your actual Google auth URL
    const googleAuthUrl = '/api/auth/google';
    
    // Either open in a popup or redirect
    // Open in a popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      googleAuthUrl,
      'Google Sign In',
      `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
    
    // Redirect approach
    // window.location.href = googleAuthUrl;
  };

  // Function would be called when user successfully logs in
  // Would need to implement a way to receive this data from your auth flow
  const handleAuthSuccess = (data: { email: string }) => {
    setIsLoggedIn(true);
    setUserEmail(data.email);
    setNotificationMessage(`Signed in as ${data.email}`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleSignOut = () => {
    // Implement sign out logic here
    setIsLoggedIn(false);
    setUserEmail('');
    setNotificationMessage('Signed out successfully');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white relative"> 
      <div className="h-full px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">TorchBlocks</h1>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          )}
          <button 
            onClick={runTests}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Run Test
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Export
          </button>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-md p-4 border border-gray-200 w-80 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Notification</h3>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">{notificationMessage}</p>
          {notificationMessage.includes('Test completed') && (
            <button
              onClick={fetchLogs}
              className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Show Logs
            </button>
          )}
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