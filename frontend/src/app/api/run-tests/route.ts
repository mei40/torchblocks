import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST() {
  try {
    const scriptPath = path.resolve(process.cwd(), '../../torchblocks/backend/antlr/run_all.sh');
    
    // Execute the shell script
    await new Promise<void>((resolve, reject) => {
      exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`Script stderr: ${stderr}`);
        }
        console.log(`Script output: ${stdout}`);
        resolve();
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error running tests:', error);
    return NextResponse.json({ success: false, error: 'Failed to run tests' }, { status: 500 });
  }
} 
