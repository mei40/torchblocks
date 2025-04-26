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
    
    // Path to the authinfo.json file
    const authInfoPath = path.join(process.cwd(), 'backend', 'google', 'build', 'authinfo.json');
    
    // Check if the file exists
    if (!fs.existsSync(authInfoPath)) {
      // For development purposes, accept any code if the file doesn't exist
      return NextResponse.json({
        success: true,
        email: 'user@example.com' // Placeholder email
      });
    }
    
    // Read and parse the JSON file
    const authInfoRaw = fs.readFileSync(authInfoPath, 'utf-8');
    const authInfo = JSON.parse(authInfoRaw);
    
    // Verify the provided code matches the expected one from the JSON file
    if (authInfo.authCode && code === authInfo.authCode) {
      return NextResponse.json({
        success: true,
        email: 'user@example.com' // This would normally come from the authentication process
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid authentication code' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying auth code:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}