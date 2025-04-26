'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { downloadNetworkJson, saveNetworkJsonToServer } from '../visualization/networkToJson';

export const Header = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [logs, setLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [authPopup, setAuthPopup] = useState<Window | null>(null);
  const { blocks, connections } = useStore();

  // Listen for messages from the authentication popup
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setIsLoggedIn(true);
        setUserEmail(event.data.email);
        setNotificationMessage(`Signed in as ${event.data.email}`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  // Check if popup is closed
  useEffect(() => {
    if (authPopup) {
      const checkPopupClosed = setInterval(() => {
        if (authPopup.closed) {
          clearInterval(checkPopupClosed);
          setAuthPopup(null);
        }
      }, 1000);

      return () => clearInterval(checkPopupClosed);
    }
  }, [authPopup]);

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

  const handleGoogleSignIn = async () => {
    // If a popup is already open, focus it instead of opening a new one
    if (authPopup && !authPopup.closed) {
      authPopup.focus();
      return;
    }
    
    // Open popup window with dimensions
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      'about:blank',
      'Google Sign In',
      `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
    
    if (!popup) {
      alert('Popup blocked by browser. Please enable popups for this site.');
      return;
    }
    
    setAuthPopup(popup);
    
    try {
      // Fetch authentication information from the backend
      const response = await fetch('/api/google/auth-info');
      
      if (!response.ok) {
        throw new Error('Failed to fetch authentication information');
      }
      
      const authInfo = await response.json();
      
      // Display authentication link in popup
      popup.document.write(`
        <html>
          <head>
            <title>Google Authentication</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
                background-color: #f7f9fc;
                line-height: 1.6;
              }
              .container {
                max-width: 450px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #333;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 20px;
                color: #555;
              }
              .link-section {
                background-color: #f0f4f8;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                word-break: break-all;
              }
              .auth-link {
                color: #4285f4;
                font-weight: bold;
              }
              .auth-code-section {
                margin-top: 30px;
              }
              input {
                width: 100%;
                padding: 10px;
                font-size: 16px;
                margin-bottom: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              button {
                background-color: #4285f4;
                color: white;
                border: none;
                padding: 12px 20px;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
              }
              button:hover {
                background-color: #357ae8;
              }
              .error-message {
                color: #d23f31;
                margin-top: 15px;
              }
              .loader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 2s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Google Authentication for TorchBlocks</h2>
              
              <div id="step1" style="display: block;">
                <p>To connect TorchBlocks with Google Colab, please:</p>
                <p>1. Click the link below to authorize TorchBlocks</p>
                <div class="link-section">
                  <a href="${authInfo.authUrl}" class="auth-link" target="_blank">${authInfo.authUrl}</a>
                </div>
                <p>2. After authorizing, you'll receive an authentication code</p>
                <p>3. Enter that code below:</p>
                
                <div class="auth-code-section">
                  <input 
                    type="text" 
                    id="authCode" 
                    placeholder="Paste authentication code here" 
                  />
                  <button id="submitCode">Submit</button>
                  <div id="errorMessage" class="error-message"></div>
                </div>
              </div>
              
              <div id="step2" style="display: none;">
                <div class="loader"></div>
                <p>Verifying authentication code...</p>
              </div>
              
              <div id="step3" style="display: none;">
                <p>Authentication successful!</p>
                <p>You'll be redirected to Google Colab in a moment...</p>
              </div>
            </div>
            
            <script>
              document.getElementById('submitCode').addEventListener('click', async function() {
                const authCode = document.getElementById('authCode').value.trim();
                
                if (!authCode) {
                  document.getElementById('errorMessage').textContent = 'Please enter the authentication code';
                  return;
                }
                
                document.getElementById('step1').style.display = 'none';
                document.getElementById('step2').style.display = 'block';
                
                try {
                  // Verify the authentication code with the backend
                  const response = await fetch('/api/google/verify-auth', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: authCode }),
                  });
                  
                  if (!response.ok) {
                    throw new Error('Invalid authentication code');
                  }
                  
                  const result = await response.json();
                  
                  // Show success message
                  document.getElementById('step2').style.display = 'none';
                  document.getElementById('step3').style.display = 'block';
                  
                  // Redirect to Colab after a brief delay
                  setTimeout(() => {
                    window.location.href = "${authInfo.colabUrl}";
                  }, 2000);
                  
                  // Notify the parent window of successful authentication
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', email: result.email }, '*');
                } catch (error) {
                  document.getElementById('step1').style.display = 'block';
                  document.getElementById('step2').style.display = 'none';
                  document.getElementById('errorMessage').textContent = error.message || 'Authentication failed. Please try again.';
                }
              });
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Authentication error:', error);
      popup.close();
      setAuthPopup(null);
      setNotificationMessage('Authentication failed. Please try again.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const handleSignOut = () => {
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