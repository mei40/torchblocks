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
  const [colabUrl, setColabUrl] = useState<string>('');
  const [authPopup, setAuthPopup] = useState<Window | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { blocks, connections } = useStore();

  // Debug function to help trace message events
  const debugLog = (message: string) => {
    console.log(`[Auth Debug] ${message}`);
  };

  useEffect(() => {
    const checkRedirectCode = () => {
      // This gets triggered when the user is redirected back from Google
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('Authentication code detected in URL - Google redirect successful');
        
        // Clean the URL to remove the code
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Call the verify-auth API with the code
        fetch('/api/google/verify-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            // Set logged in state
            setIsLoggedIn(true);
            setUserEmail(result.email || 'user@torchblocks.com');
            setNotificationMessage(`Signed in as ${result.email || 'user@torchblocks.com'}`);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
          } else {
            setNotificationMessage('Authentication failed. Please try again.');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
          }
        })
        .catch(error => {
          console.error('Error verifying auth code:', error);
          setNotificationMessage('Authentication error. Please try again.');
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        });
      }
    };
    
    checkRedirectCode();
  }, []);

  // Listen for messages from the authentication popup
  useEffect(() => {
    debugLog("Setting up message event listener");
    
    const handleAuthMessage = (event: MessageEvent) => {
      debugLog(`Received message: ${JSON.stringify(event.data)}`);
      
      // Handle the new AUTH_CODE_RECEIVED message type
      if (event.data?.type === 'AUTH_CODE_RECEIVED') {
        debugLog("Auth code received message");
        
        // Verify the auth code with the backend
        const code = event.data.code;
        if (code) {
          fetch('/api/google/verify-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              setIsLoggedIn(true);
              setUserEmail(result.email || 'user@torchblocks.com');
              
              setNotificationMessage(`Signed in as ${result.email || 'user@torchblocks.com'}`);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5000);
            } else {
              setNotificationMessage(`Authentication failed: ${result.error || 'Unknown error'}`);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5000);
            }
          })
          .catch(error => {
            console.error('Error verifying auth code:', error);
            setNotificationMessage('Authentication error. Please try again.');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
          });
        }
      }
      // Keep your existing message handling for GOOGLE_AUTH_SUCCESS and GOOGLE_AUTH_ERROR
      else if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        // Your existing code...
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        // Your existing code...
      }
    };
  
    window.addEventListener('message', handleAuthMessage);
    debugLog("Message event listener added");
    
    return () => {
      window.removeEventListener('message', handleAuthMessage);
      debugLog("Message event listener removed");
    };
  }, [authPopup]);  // Keep any dependencies you already have
  
  // Check if popup is closed
  useEffect(() => {
    if (authPopup) {
      debugLog("Starting popup monitoring interval");
      const checkPopupClosed = setInterval(() => {
        if (authPopup.closed) {
          debugLog("Auth popup detected as closed");
          clearInterval(checkPopupClosed);
          setAuthPopup(null);
        }
      }, 1000);

      return () => {
        clearInterval(checkPopupClosed);
        debugLog("Popup monitoring interval cleared");
      };
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

  const handleUploadToColab = async () => {
    try {
      setIsUploading(true);
      setNotificationMessage('Uploading model to Google Colab...');
      setShowNotification(true);
      
      const response = await fetch('/api/upload-to-colab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelFile: 'backend/google/build/PrimaryModel.ipynb'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload to Colab');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setNotificationMessage('Model upload started. The Colab link will appear when ready.');
        
        // Start checking for the Colab link
        startCheckingForColabLink();
      } else {
        setIsUploading(false);
        setNotificationMessage(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setIsUploading(false);
      console.error('Error uploading to Colab:', error);
      setNotificationMessage(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Function to check for Colab link
  const startCheckingForColabLink = () => {
    let checkCount = 0;
    const maxChecks = 24; // Check for up to 2 minutes (24 * 5 seconds)
    
    const checkInterval = setInterval(async () => {
      try {
        checkCount++;
        
        // Fetch the latest auth info
        const response = await fetch('/api/google/auth-info');
        const authInfo = await response.json();
        
        console.log(`Checking for Colab link (attempt ${checkCount}/${maxChecks}):`, authInfo.colabUrl);
        
        if (authInfo.colabUrl && 
            authInfo.colabUrl !== colabUrl && 
            !authInfo.colabUrl.includes('placeholder') &&
            authInfo.colabUrl.includes('colab.research.google.com')) {
          // We have a valid Colab URL
          setColabUrl(authInfo.colabUrl);
          setIsUploading(false);
          setNotificationMessage('Your model is ready in Google Colab!');
          setShowNotification(true);
          
          // Stop checking once we have the URL
          clearInterval(checkInterval);
          
          // Automatically open the Colab link in a new tab
          window.open(authInfo.colabUrl, '_blank');
        }
        
        // Stop after maximum number of attempts
        if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          if (isUploading) {
            setIsUploading(false);
            setNotificationMessage('Colab link generation timed out or failed. Please check console logs and verify authentication configuration.');
            setShowNotification(true);
          }
        }
      } catch (error) {
        console.error('Error checking for Colab link:', error);
        
        // If too many consecutive errors, stop checking
        if (checkCount >= 3) {
          clearInterval(checkInterval);
          setIsUploading(false);
          setNotificationMessage('Error while checking for Colab link. Please try again.');
          setShowNotification(true);
        }
      }
    }, 5000); // Check every 5 seconds
  };
  
// This is a modified version of the handleGoogleSignIn function in Header.tsx
// Replace your existing function with this one

const handleGoogleSignIn = async () => {
  debugLog("Google Sign In button clicked");
  
  // If a popup is already open, focus it instead of opening a new one
  if (authPopup && !authPopup.closed) {
    debugLog("Auth popup already open, focusing it");
    authPopup.focus();
    return;
  }
  
  try {
    // Fetch authentication information from the backend
    debugLog("Fetching auth info from backend");
    const response = await fetch('/api/google/auth-info');
    
    if (!response.ok) {
      throw new Error('Failed to fetch authentication information');
    }
    
    const authInfo = await response.json();
    debugLog(`Auth Info received: ${JSON.stringify(authInfo)}`);
    
    // Only continue if we have a valid auth URL that's not the placeholder
    if (!authInfo.authUrl || authInfo.authUrl.includes('placeholder-auth-url-will-be-here')) {
      debugLog("Invalid or placeholder auth URL received");
      setNotificationMessage('Authentication information not available. Please try again later.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      return;
    }
    
    // Open popup window with dimensions
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    debugLog("Opening auth popup window");
    
    // Open the auth URL directly in the popup
    const popup = window.open(
      authInfo.authUrl,
      'Google Sign In',
      `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
    
    if (!popup) {
      debugLog("Popup was blocked");
      alert('Popup blocked by browser. Please enable popups for this site.');
      return;
    }
    
    debugLog("Auth popup created successfully");
    setAuthPopup(popup);
    
    // Need to check for redirect code
    // This interval checks the URL of the popup to detect when Google redirects back to our site
    const popupCheckInterval = setInterval(() => {
      try {
        // This will throw an error if popup is on a different domain due to same-origin policy
        if (popup.closed) {
          debugLog("Popup closed");
          clearInterval(popupCheckInterval);
          setAuthPopup(null);
          return;
        }
        
        // Check if we can access the popup location
        const popupUrl = popup.location.href;
        debugLog(`Popup URL: ${popupUrl}`);
        
        // If we're back on our domain and have a code parameter
        if (popupUrl.includes('localhost:3000') && popupUrl.includes('code=')) {
          debugLog("Detected auth code in popup URL");
          clearInterval(popupCheckInterval);
          
          // Extract the code from URL
          const url = new URL(popupUrl);
          const code = url.searchParams.get('code');
          
          if (code) {
            debugLog(`Extracted auth code: ${code}`);
            
            // Close the popup immediately to prevent UI flicker
            popup.close();
            setAuthPopup(null);
            
            // Send the code to backend
            verifyAuthCode(code);
          }
        }
      } catch (e) {
        // Access to popup location is restricted while on Google domain
        // This is normal due to cross-origin restrictions
        // We just wait until the popup returns to our domain
      }
    }, 100); // Check more frequently to catch the redirect faster
    
  } catch (error) {
    debugLog(`Authentication error: ${error}`);
    console.error('Authentication error:', error);
    if (authPopup) {
      authPopup.close();
      setAuthPopup(null);
    }
    setNotificationMessage('Authentication failed. Please try again.');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }
};

// Add this function to handle the auth code verification if it doesn't exist
const verifyAuthCode = async (code: string) => {
  try {
    debugLog(`Verifying auth code: ${code}`);
    
    const response = await fetch('/api/google/verify-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify authentication code');
    }
    
    const result = await response.json();
    
    if (result.success) {
      debugLog("Auth code verification successful");
      setIsLoggedIn(true);
      setUserEmail(result.email || 'user@torchblocks.com');
      
      setNotificationMessage(`Signed in as ${result.email || 'user@torchblocks.com'}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } else {
      throw new Error(result.error || 'Authentication verification failed');
    }
  } catch (error) {
    debugLog(`Auth code verification error: ${error}`);
    console.error('Authentication verification error:', error);
    setNotificationMessage(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }
};

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setColabUrl('');
    setIsUploading(false);
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
              {isUploading ? (
                <button
                  disabled
                  className="px-4 py-2 text-sm bg-gray-400 text-white rounded-md cursor-not-allowed"
                >
                  Uploading...
                </button>
              ) : colabUrl ? (
                <button
                  onClick={() => window.open(colabUrl, '_blank')}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Open Colab
                </button>
              ) : (
                <button
                  onClick={handleUploadToColab}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Upload to Colab
                </button>
              )}
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
          {isLoggedIn && colabUrl && notificationMessage.includes('Your model is ready') && (
            <button
              onClick={() => window.open(colabUrl, '_blank')}
              className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Open Google Colab
            </button>
          )}
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          <pre id="auth-debug-info">
            {JSON.stringify({
              isLoggedIn,
              userEmail,
              hasAuthPopup: !!authPopup,
              popupClosed: authPopup ? authPopup.closed : null,
              colabUrl,
              isUploading
            }, null, 2)}
          </pre>
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