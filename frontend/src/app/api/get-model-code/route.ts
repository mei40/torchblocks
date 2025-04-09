import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Construct the path relative to the project root (one level up from frontend cwd)
    const projectRoot = path.resolve(process.cwd(), '..');
    const filePath = path.join(projectRoot, 'backend/local/build/PrimaryModel.py');

    // Check if the path is correct (for debugging)
    // console.log('Attempting to read file from:', filePath);

    // Read the file content
    const code = await fs.readFile(filePath, 'utf-8');

    // Return the code content
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error reading model file:', error);
    // Determine if the error is a file not found error
    const isFileNotFound = (error as NodeJS.ErrnoException).code === 'ENOENT';
    return NextResponse.json(
      { error: isFileNotFound ? 'Model file not found.' : 'Failed to read model file' },
      { status: isFileNotFound ? 404 : 500 }
    );
  }
} 