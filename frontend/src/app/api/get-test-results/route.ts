import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Construct the path relative to the project root (one level up from frontend cwd)
    const projectRoot = path.resolve(process.cwd(), '..');
    const filePath = path.join(projectRoot, 'backend/local/build/local_results.json');

    // Read the file content
    const data = await fs.readFile(filePath, 'utf-8');

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Return the parsed JSON data
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error reading or parsing results file:', error);
    let errorMessage = 'Failed to load test results.';
    let status = 500;

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      errorMessage = 'Results file not found.';
      status = 404;
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Failed to parse results file (invalid JSON).';
      status = 500;
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
} 