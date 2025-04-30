import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return new Response(`
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              if (window.opener) {
                try {
                  window.opener.postMessage({ 
                    type: 'GOOGLE_AUTH_ERROR', 
                    error: '${error}' 
                  }, '*');
                  console.log("Sent error message to parent window");
                } catch (e) {
                  console.error("Error posting message:", e);
                }
                setTimeout(() => window.close(), 2000);
              } else {
                console.error("No window.opener found");
              }
            </script>
          </head>
          <body>
            <p>Authentication failed. This window will close automatically.</p>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    if (!code) {
      return new Response(`
        <html>
          <head>
            <title>Authentication Error</title>
            <script>
              if (window.opener) {
                try {
                  window.opener.postMessage({ 
                    type: 'GOOGLE_AUTH_ERROR', 
                    error: 'No authorization code received' 
                  }, '*');
                  console.log("Sent error message to parent window");
                } catch (e) {
                  console.error("Error posting message:", e);
                }
                setTimeout(() => window.close(), 2000);
              } else {
                console.error("No window.opener found");
              }
            </script>
          </head>
          <body>
            <p>No authorization code received. This window will close automatically.</p>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Save the auth code
    const projectRoot = path.resolve(process.cwd(), '../');
    const authInfoPath = path.join(projectRoot, 'backend', 'google', 'build', 'authinfo.json');
    
    // Check if we have a Colab link
    let colabUrl = '';
    let authInfo = null;
    
    try {
      if (fs.existsSync(authInfoPath)) {
        const authInfoRaw = fs.readFileSync(authInfoPath, 'utf-8');
        authInfo = JSON.parse(authInfoRaw);
        colabUrl = authInfo.colab_link || '';
        
        // Update the auth code
        authInfo.auth_code = code;
        fs.writeFileSync(authInfoPath, JSON.stringify(authInfo, null, 2));
        console.log('Updated auth code in authinfo.json');
      } else {
        console.error('authinfo.json file not found');
      }
    } catch (e) {
      console.error('Error reading/writing authinfo.json:', e);
    }

    // Return success page that will close itself and notify the opener
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin-top: 50px;
            }
            .success-message {
              padding: 20px;
              background-color: #d4edda;
              border-radius: 5px;
              color: #155724;
              max-width: 400px;
              margin: 0 auto;
            }
            .colab-button {
              display: ${colabUrl ? 'inline-block' : 'none'};
              background-color: #4285f4;
              color: white;
              border: none;
              padding: 10px 20px;
              margin-top: 15px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: bold;
            }
          </style>
          <script>
            // Add a delay before sending the message to ensure the page is fully loaded
            window.onload = function() {
              console.log("Window loaded, preparing to send message");
              
              // Check if window.opener exists
              if (window.opener) {
                try {
                  console.log("Sending success message to parent window");
                  window.opener.postMessage({ 
                    type: 'GOOGLE_AUTH_SUCCESS', 
                    email: 'user@torchblocks.com',
                    code: '${code}',
                    colabUrl: '${colabUrl}'
                  }, '*');
                } catch (e) {
                  console.error("Error posting message:", e);
                }
                
                // Close the window after a short delay if no Colab link
                ${!colabUrl ? `
                setTimeout(() => {
                  console.log("Closing window");
                  window.close();
                }, 2000);
                ` : ''}
              } else {
                console.error("No window.opener found");
              }
            };

            function openColabAndClose() {
              window.open('${colabUrl}', '_blank');
              setTimeout(() => window.close(), 500);
            }
          </script>
        </head>
        <body>
          <div class="success-message">
            <h2>Authentication Successful!</h2>
            <p>You have successfully authenticated with Google.</p>
            ${colabUrl ? `
            <p>Click the button below to open your TorchBlocks notebook in Google Colab:</p>
            <a href="javascript:openColabAndClose()" class="colab-button">Open in Google Colab</a>
            ` : `
            <p>This window will close automatically in a moment.</p>
            `}
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(`
      <html>
        <head>
          <title>Server Error</title>
          <script>
            if (window.opener) {
              try {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'Server error' }, '*');
                console.log("Sent error message to parent window");
              } catch (e) {
                console.error("Error posting message:", e);
              }
              setTimeout(() => window.close(), 2000);
            } else {
              console.error("No window.opener found");
            }
          </script>
        </head>
        <body>
          <p>Server error. This window will close automatically.</p>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}