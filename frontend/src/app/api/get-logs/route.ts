import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    console.log("pwd", process.cwd());
    const logPath = path.resolve(process.cwd(), '../../torchblocks/backend/antlr/log_sample.log');
    
    // Read the log file
    const logContent = await fs.readFile(logPath, 'utf-8');
    
    return new NextResponse(logContent, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
} 