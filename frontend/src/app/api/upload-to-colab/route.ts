import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    // Get the model filename from the request
    const { modelFile = 'backend/google/build/PrimaryModel.ipynb' } = await request.json();
    
    const projectRoot = path.resolve(process.cwd(), '../');
    const scriptPath = path.join(projectRoot, 'backend', 'google', 'file_uploader.py');
    const filePath = path.join(projectRoot, modelFile);
    
    // Check if source files exist
    if (!fs.existsSync(scriptPath)) {
      console.error(`Script not found at: ${scriptPath}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Upload script not found' 
      }, { status: 404 });
    }
    
    if (!fs.existsSync(filePath)) {
      console.error(`Model file not found at: ${filePath}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Model file not found' 
      }, { status: 404 });
    }
    
    // Check for required supporting files
    const skeletonAuthPath = path.join(projectRoot, 'backend', 'google', 'SkeletonAuth.json');
    if (!fs.existsSync(skeletonAuthPath)) {
      // Create the skeleton file if it doesn't exist
      try {
        const skeletonContent = JSON.stringify({
          "auth_link": "",
          "auth_code": "",
          "colab_link": ""
        }, null, 2);
        
        fs.writeFileSync(skeletonAuthPath, skeletonContent);
        console.log(`Created missing file: ${skeletonAuthPath}`);
      } catch (error) {
        console.error('Error creating skeleton auth file:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to create required skeleton file'
        }, { status: 500 });
      }
    }
    
    // Add check for other required files
    const resultsFolderPath = path.join(projectRoot, 'backend', 'local', 'build');
    if (!fs.existsSync(resultsFolderPath)) {
      try {
        fs.mkdirSync(resultsFolderPath, { recursive: true });
        console.log(`Created missing directory: ${resultsFolderPath}`);
      } catch (error) {
        console.error('Error creating results directory:', error);
      }
    }
    
    console.log(`Executing: python3 ${scriptPath} ${filePath}`);
    
    // Run the upload script (non-blocking)
    // We'll run this in the background and not wait for it to complete
    // as the script has a long-running loop at the end
    exec(`python3 ${scriptPath} ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
      }
      console.log(`Script stdout: ${stdout}`);
    });
    
    // Immediately return success since we're running the process in the background
    return NextResponse.json({ 
      success: true, 
      message: 'Upload process started successfully' 
    });
    
  } catch (error) {
    console.error('Error uploading to Colab:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload to Colab' },
      { status: 500 }
    );
  }
}