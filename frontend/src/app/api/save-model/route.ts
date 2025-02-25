import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { jsonContent, filename } = await request.json();
    
    // Create build directory if it doesn't exist
    const buildDir = path.resolve(process.cwd(), 'build');
    try {
      await fs.access(buildDir);
    } catch {
      await fs.mkdir(buildDir, { recursive: true });
    }
    
    // Write the JSON file to the build directory
    const filePath = path.join(buildDir, filename);
    await fs.writeFile(filePath, jsonContent);
    
    console.log(`Model saved to ${filePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Model saved to build/${filename}`,
      path: filePath
    });
  } catch (error) {
    console.error('Error saving model:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save model' 
    }, { status: 500 });
  }
} 