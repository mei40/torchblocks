import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Helper function to generate authinfo if needed
async function generateAuthInfo() {
  try {
    const projectRoot = path.resolve(process.cwd(), '../');
    const scriptPath = path.join(projectRoot, 'backend', 'upload_files.sh');
    
    if (fs.existsSync(scriptPath)) {
      await execPromise(`bash ${scriptPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error generating auth info:', error);
    return false;
  }
}

export async function GET() {
  try {
    // Path to the authinfo.json file
    const projectRoot = path.resolve(process.cwd(), '../');
    const authInfoPath = path.join(projectRoot, 'backend', 'google', 'build', 'authinfo.json');
    
    // Check if we need to generate the auth info
    // if (!fs.existsSync(authInfoPath)) {
    //   const generated = await generateAuthInfo();
    //   if (!generated) {
    //     console.log('Could not generate auth info file');
    //   }
    // }
    
    // If file still doesn't exist, return placeholders
    if (!fs.existsSync(authInfoPath)) {
      // Create a skeleton authinfo.json file
      const skeletonContent = JSON.stringify({
        "auth_link": "",
        "auth_code": "",
        "colab_link": ""
      }, null, 2);
      fs.writeFileSync(authInfoPath, skeletonContent);
      console.log(`Created missing file: ${authInfoPath}`);
    }
    
    // Read the file content
    const authInfoRaw = fs.readFileSync(authInfoPath, 'utf-8');
    console.log('Auth info file content:', authInfoRaw);
    
    let clientId = '';
    let scope = '';
    let colabUrl = '';
    
    try {
      // Try to parse as JSON
      const authInfo = JSON.parse(authInfoRaw);
      colabUrl = authInfo.colab_link || '';
      
      // Extract client_id and scope from the auth_link
      if (authInfo.auth_link) {
        const clientIdMatch = authInfo.auth_link.match(/client_id=([^&]+)/);
        if (clientIdMatch) {
          clientId = clientIdMatch[1];
        }
        
        const scopeMatch = authInfo.auth_link.match(/scope=([^&]+)/);
        if (scopeMatch) {
          scope = scopeMatch[1];
        }
      }
      
      // Default client ID if not found
      if (!clientId) {
        clientId = '796649441383-u18pkja2afmd9g037600u83p5pq72sn6.apps.googleusercontent.com';
      }
      
      // Default scope if not found
      if (!scope) {
        scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file';
      }
      
      // Create a new valid auth URL
      const validAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=${scope}&access_type=offline&response_type=code`;
      
      console.log('Generated valid auth URL:', validAuthUrl);
      
      // Update the authinfo.json file with the new URL to ensure backend scripts use it
      authInfo.auth_link = validAuthUrl;
      fs.writeFileSync(authInfoPath, JSON.stringify(authInfo, null, 2));
      
      return NextResponse.json({
        authUrl: validAuthUrl,
        colabUrl: colabUrl || 'https://colab.research.google.com/placeholder-notebook-url-will-be-here'
      });
    } catch (e) {
      console.error('Error parsing JSON:', e);
      
      // Fallback to manual extraction from raw file content
      const urlMatch = authInfoRaw.match(/https:\/\/accounts\.google\.com\/o\/oauth2\/auth[^"'\s]+/);
      if (urlMatch) {
        const origUrl = urlMatch[0];
        
        // Extract client_id and scope
        const clientIdMatch = origUrl.match(/client_id=([^&]+)/);
        if (clientIdMatch) {
          clientId = clientIdMatch[1];
        }
        
        const scopeMatch = origUrl.match(/scope=([^&]+)/);
        if (scopeMatch) {
          scope = scopeMatch[1];
        }
      }
      
      // Default client ID if not found
      if (!clientId) {
        clientId = '796649441383-u18pkja2afmd9g037600u83p5pq72sn6.apps.googleusercontent.com';
      }
      
      // Default scope if not found
      if (!scope) {
        scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file';
      }
      
      // Create a new valid auth URL
      const validAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fgoogle%2Foauth-callback&scope=${scope}&access_type=offline&response_type=code`;
      
      console.log('Generated valid auth URL from raw content:', validAuthUrl);
      
      return NextResponse.json({
        authUrl: validAuthUrl,
        colabUrl: colabUrl || 'https://colab.research.google.com/placeholder-notebook-url-will-be-here'
      });
    }
  } catch (error) {
    console.error('Error fetching auth info:', error);
    return NextResponse.json(
      { error: 'Failed to load authentication information' },
      { status: 500 }
    );
  }
}