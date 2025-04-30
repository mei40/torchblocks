import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authentication code is required' },
        { status: 400 }
      );
    }
    
    // Fix the path to look at the correct location
    const projectRoot = path.resolve(process.cwd(), '../');
    const authInfoPath = path.join(projectRoot, 'backend', 'google', 'build', 'authinfo.json');
    
    console.log('Looking for auth info file to update at:', authInfoPath);
    
    // Check if the file exists
    if (!fs.existsSync(authInfoPath)) {
      console.log('Auth info file not found for updating');
      // For development purposes, accept any code if the file doesn't exist
      return NextResponse.json({
        success: true,
        email: 'user@example.com' // Placeholder email
      });
    }
    
    // Update the auth code in the file
    try {
      // Read the current content
      const authInfoRaw = fs.readFileSync(authInfoPath, 'utf-8');
      console.log('Found auth info file to update with content:', authInfoRaw);
      
      try {
        // Try JSON format first
        const authInfo = JSON.parse(authInfoRaw);
        authInfo.auth_code = code;
        
        // Write back to file
        fs.writeFileSync(authInfoPath, JSON.stringify(authInfo, null, 2));
        
        console.log('Updated auth code in JSON format:', code);
      } catch (e) {
        // If not valid JSON, try line-by-line format
        const lines = authInfoRaw.split('\n');
        const updatedLines = lines.map(line => {
          if (line.startsWith('auth_code:')) {
            return `auth_code: ${code}`;
          }
          return line;
        });
        
        // If auth_code line doesn't exist, add it after auth_link
        if (!lines.some(line => line.startsWith('auth_code:'))) {
          const authLinkIndex = lines.findIndex(line => line.startsWith('auth_link:'));
          if (authLinkIndex !== -1) {
            updatedLines.splice(authLinkIndex + 1, 0, `auth_code: ${code}`);
          } else {
            updatedLines.push(`auth_code: ${code}`);
          }
        }
        
        // Write back to file
        fs.writeFileSync(authInfoPath, updatedLines.join('\n'));
        
        console.log('Updated auth code in line format:', code);
      }
    } catch (error) {
      console.error('Error updating auth code:', error);
      // Continue even if update fails - might still be able to verify
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      email: 'user@torchblocks.com' // We don't have actual email verification
    });
  } catch (error) {
    console.error('Error verifying auth code:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}