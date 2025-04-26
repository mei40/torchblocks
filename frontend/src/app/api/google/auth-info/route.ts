import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the authinfo.json file
    const authInfoPath = path.join(process.cwd(), 'backend', 'google', 'build', 'authinfo.json');
    
    // Check if the file exists
    if (!fs.existsSync(authInfoPath)) {
      // Return placeholder data if the file doesn't exist yet
      return NextResponse.json({
        authUrl: 'https://accounts.google.com/o/oauth2/auth?placeholder-auth-url-will-be-here',
        colabUrl: 'https://colab.research.google.com/placeholder-notebook-url-will-be-here'
      });
    }
    
    // Read and parse the JSON file
    const authInfoRaw = fs.readFileSync(authInfoPath, 'utf-8');
    const authInfo = JSON.parse(authInfoRaw);
    
    return NextResponse.json({
      authUrl: authInfo.authUrl || 'https://accounts.google.com/o/oauth2/auth?placeholder-auth-url-will-be-here',
      colabUrl: authInfo.colabUrl || 'https://colab.research.google.com/placeholder-notebook-url-will-be-here'
    });
  } catch (error) {
    console.error('Error fetching auth info:', error);
    return NextResponse.json(
      { error: 'Failed to load authentication information' },
      { status: 500 }
    );
  }
}

