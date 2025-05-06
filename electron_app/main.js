const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url'); // Import the 'url' module
const { spawn } = require('child_process'); // Added for running external commands
const fs = require('fs').promises; // Added for file system operations

// --- User-Writable Data Paths ---
// Base path for all application-specific writable data
const USER_DATA_PATH = app.getPath('userData');

// Path for the Python virtual environment
const VENV_PATH = path.join(USER_DATA_PATH, 'torchblocks_env');

// Root path for dynamically generated data, logs, and configs from backend operations
const DYNAMIC_DATA_ROOT_PATH = path.join(USER_DATA_PATH, 'torchblocks_data');

// Path for model.json saved from the frontend
const MODEL_CONFIG_PATH = path.join(DYNAMIC_DATA_ROOT_PATH, 'model_config'); // model.json will be here

// Path for outputs of compile_main.py (e.g., PrimaryModel.py)
const COMPILE_OUTPUT_PATH = path.join(DYNAMIC_DATA_ROOT_PATH, 'build');

// Path for outputs of run_main.py (e.g., local_results.json)
const RUN_OUTPUT_PATH = path.join(DYNAMIC_DATA_ROOT_PATH, 'local', 'build');

// Path for outputs of Google-related scripts (e.g., client_secrets.json, PrimaryModel.ipynb)
const GOOGLE_BUILD_PATH = path.join(DYNAMIC_DATA_ROOT_PATH, 'google', 'build');

// Path for model_run.log (if we decide to move it from backend/ to userData)
// For now, let's assume model_run.log from run_all.sh will be handled differently or its script modified.
// If direct IPC calls to run_main.py produce logs, they could be piped to a file in DYNAMIC_DATA_ROOT_PATH.
// const APP_LOG_PATH = path.join(DYNAMIC_DATA_ROOT_PATH, 'logs');

// Helper function to run a command and return a promise
function runCommand(command, args, cwd, customEnv = null, progressCallback, statusCallback) {
  return new Promise((resolve, reject) => {
    const options = { cwd, shell: true, stdio: 'pipe' };
    if (customEnv) {
      options.env = { ...process.env, ...customEnv };
    }

    if (statusCallback) statusCallback(`Executing: ${command} ${args.join(' ')} in ${cwd}`);

    const childProcess = spawn(command, args, options);
    let stdout = '';
    let stderr = '';

    // Get the mainWindow to send progress updates
    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    childProcess.stdout.on('data', (data) => {
      const logMsg = data.toString();
      stdout += logMsg;
      if (progressCallback) progressCallback(logMsg);
      else console.log(`stdout: ${logMsg}`);
    });

    childProcess.stderr.on('data', (data) => {
      const logMsg = data.toString();
      stderr += logMsg;
      if (progressCallback) progressCallback(`stderr: ${logMsg}`);
      else console.error(`stderr: ${logMsg}`);
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        if (statusCallback) statusCallback(`Command finished successfully: ${command} ${args.join(' ')}`);
        resolve({ stdout, stderr });
      } else {
        const errorMsg = `Command failed with code ${code}: ${command} ${args.join(' ')}\\nStderr: ${stderr}\\nStdout: ${stdout}`;
        if (statusCallback) statusCallback(errorMsg);
        reject(new Error(errorMsg));
      }
    });

    childProcess.on('error', (err) => {
      if (statusCallback) statusCallback(`Command execution error: ${err.message}`);
      reject(err);
    });
  });
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200, // You can adjust the size
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // <--- UNCOMMENT AND VERIFY THIS LINE
      nodeIntegration: false, // Recommended for security
      contextIsolation: true, // Recommended for security
    }
  });

  // Construct the path to the Next.js export's index.html
  // __dirname here is torchblocks/electron_app/
  // So we go up one level to torchblocks/, then into frontend/out/index.html
  const startUrl = url.format({
    pathname: path.join(__dirname, '../frontend/out/index.html'), // Adjusted path
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);
  // Or, if you want to serve it over HTTP (more complex setup for HMR in dev):
  // For a static export, 'file://' protocol is simplest for now.

  // Open the DevTools (optional, for debugging)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // IPC Handler for Python Environment Setup
  ipcMain.handle('install-python-env', async (event) => {
    const projectRootPathForReqs = path.join(__dirname, '..'); // Path to project root to find backend/requirements.txt
    const requirementsFilePath = path.join(projectRootPathForReqs, 'backend', 'requirements.txt');
    
    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    const sendStatusUpdate = (message) => {
      if (mainWindow) {
        mainWindow.webContents.send('install-python-env-status', message);
      }
      console.log(message);
    };
    const sendProgressUpdate = (logMsg) => {
      if (mainWindow) {
        mainWindow.webContents.send('install-python-env-progress', logMsg);
      }
      // console.log(logMsg); // Progress logs can be verbose for console, optional
    };

    let pythonCmd = 'python3'; // Default

    try {
      sendStatusUpdate('Step 1/4: Checking Python 3 availability...');
      try {
        await runCommand(pythonCmd, ['--version'], projectRootPathForReqs, null, sendProgressUpdate, sendStatusUpdate);
        sendStatusUpdate('Python 3 found.');
      } catch (error) {
        sendStatusUpdate('Python 3 check failed. Trying "python"...');
        pythonCmd = 'python'; // Fallback to 'python'
        try {
            await runCommand(pythonCmd, ['--version'], projectRootPathForReqs, null, sendProgressUpdate, sendStatusUpdate);
            sendStatusUpdate('Python (fallback) found.');
        } catch (fallbackError) {
            sendStatusUpdate('Python check failed for both "python3" and "python".');
            console.error('Python 3 is not installed or not found in PATH.', fallbackError);
            return { success: false, message: 'Python 3 is not installed or not found in PATH.', log: `${error.message}\\n${fallbackError.message}` };
        }
      }

      sendStatusUpdate(`Step 2/4: Creating virtual environment at: ${VENV_PATH}`);
      await runCommand(pythonCmd, ['-m', 'venv', VENV_PATH], USER_DATA_PATH, null, sendProgressUpdate, sendStatusUpdate);
      sendStatusUpdate('Virtual environment created.');

      let venvPythonExecutable = '';
      if (process.platform === 'win32') {
        venvPythonExecutable = path.join(VENV_PATH, 'Scripts', 'python.exe');
      } else {
        venvPythonExecutable = path.join(VENV_PATH, 'bin', 'python');
      }
      sendStatusUpdate(`Virtual environment Python executable: ${venvPythonExecutable}`);

      sendStatusUpdate(`Step 3/4: Installing dependencies from ${requirementsFilePath}...`);
      const installResult = await runCommand(
        venvPythonExecutable,
        ['-m', 'pip', 'install', '-r', requirementsFilePath],
        USER_DATA_PATH, // CWD for pip install can also be USER_DATA_PATH
        null, // no customEnv
        sendProgressUpdate, // progress callback
        sendStatusUpdate    // status callback
      );
      sendStatusUpdate('Step 4/4: Dependencies installed successfully.');
      
      return { success: true, message: 'Python environment setup complete!', log: installResult.stdout + '\\n' + installResult.stderr };

    } catch (error) {
      console.error('Error during Python environment setup:', error);
      sendStatusUpdate(`Error during Python environment setup: ${error.message}`);
      return { success: false, message: `Error setting up Python environment: ${error.message}`, log: error.stack };
    }
  });

  // IPC Handler for running compile_main.py
  ipcMain.handle('run-compile-main', async (event, modelJsonPathFromFrontend) => {
    const projectRoot = path.join(__dirname, '..'); // For script path and CWD
    const compileScriptPath = path.join(projectRoot, 'backend', 'antlr', 'compile_main.py');
    // modelJsonPathFromFrontend is the absolute path to model.json (e.g., in MODEL_CONFIG_PATH)
    
    const outputPrimaryModelPyPath = path.join(COMPILE_OUTPUT_PATH, 'PrimaryModel.py');

    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    const sendStatus = (message) => {
      if (mainWindow) {
        mainWindow.webContents.send('compile-main-status', message);
      }
      console.log(message);
    };
    const sendProgress = (logMsg) => {
      if (mainWindow) {
        mainWindow.webContents.send('compile-main-progress', logMsg);
      }
      // console.log(logMsg); 
    };
    
    const venvPythonExecutable = process.platform === 'win32' ? path.join(VENV_PATH, 'Scripts', 'python.exe') : path.join(VENV_PATH, 'bin', 'python');

    try {
      sendStatus('Step 1/3: Preparing output directory for compiled model...');
      await fs.mkdir(COMPILE_OUTPUT_PATH, { recursive: true });
      sendStatus('Output directory prepared.');

      sendStatus(`Step 2/3: Starting code generation (compile_main.py) for ${modelJsonPathFromFrontend}...`);
      const result = await runCommand(
        venvPythonExecutable, 
        [compileScriptPath, modelJsonPathFromFrontend, outputPrimaryModelPyPath], // Args: script, input_json, output_py
        path.join(projectRoot, 'backend', 'antlr'), // CWD for compile_main.py
        null, 
        sendProgress, 
        sendStatus 
      );
      sendStatus('Step 3/3: Code generation finished!');
      return { success: true, message: 'compile_main.py executed successfully.', log: result.stdout + '\n' + result.stderr };
    } catch (error) {
      console.error('Error running compile_main.py:', error);
      sendStatus(`Error running compile_main.py: ${error.message}`);
      return { success: false, message: `Error running compile_main.py: ${error.message}`, log: error.stack };
    }
  });

  // IPC Handler for running run_main.py
  ipcMain.handle('run-run-main', async (event, epochs) => {
    const projectRoot = path.join(__dirname, '..'); // For script path and CWD
    const runScriptPath = path.join(projectRoot, 'backend', 'local', 'run_main.py');
    const numEpochs = epochs || '2'; // Default to 2 epochs if not provided
    
    const inputPrimaryModelPyPath = path.join(COMPILE_OUTPUT_PATH, 'PrimaryModel.py');
    const outputResultsJsonPath = path.join(RUN_OUTPUT_PATH, 'local_results.json');

    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    const sendStatus = (message) => {
      if (mainWindow) mainWindow.webContents.send('run-main-status', message);
      console.log(message);
    };
    const sendProgress = (logMsg) => {
      if (mainWindow) mainWindow.webContents.send('run-main-progress', logMsg);
      // console.log(logMsg);
    };
    
    const venvPythonExecutable = process.platform === 'win32' ? path.join(VENV_PATH, 'Scripts', 'python.exe') : path.join(VENV_PATH, 'bin', 'python');

    try {
      sendStatus('Step 1/3: Preparing directory for model training results...');
      await fs.mkdir(RUN_OUTPUT_PATH, { recursive: true });
      sendStatus('Results directory prepared.');

      sendStatus(`Step 2/3: Starting model training (run_main.py) for ${numEpochs} epochs...`);
      // run_main.py will take: numEpochs, inputPrimaryModelPyPath, outputResultsJsonPath
      const result = await runCommand(
        venvPythonExecutable, 
        [runScriptPath, numEpochs.toString(), inputPrimaryModelPyPath, outputResultsJsonPath], 
        projectRoot, // CWD for run_main.py (e.g., project root for backend.local imports)
        null, 
        sendProgress, 
        sendStatus
      );
      sendStatus('Step 3/3: Model training finished!');
      return { success: true, message: 'run_main.py executed successfully.', log: result.stdout + '\n' + result.stderr };
    } catch (error) {
      console.error('Error running run_main.py:', error);
      sendStatus(`Error running run_main.py: ${error.message}`);
      return { success: false, message: `Error running run_main.py: ${error.message}`, log: error.stack };
    }
  });

  // IPC Handler for saving the model JSON
  ipcMain.handle('save-model-json', async (event, { jsonContent, filename }) => {
    // const projectRoot = path.join(__dirname, '..'); // torchblocks root - No longer directly needed for output path
    // Save within MODEL_CONFIG_PATH relative to project root
    // const buildDir = path.join(projectRoot, 'frontend', 'build'); // OLD PATH
    const filePath = path.join(MODEL_CONFIG_PATH, filename);

    try {
      // Ensure the directory exists
      await fs.mkdir(MODEL_CONFIG_PATH, { recursive: true });
      // Write the file
      await fs.writeFile(filePath, jsonContent, 'utf-8');
      console.log(`Model saved via IPC to: ${filePath}`);
      return { success: true, message: `Model saved to ${filePath}`, path: filePath }; // Return the full, new path
    } catch (error) {
      console.error('IPC Error saving model JSON:', error);
      return { success: false, message: `Failed to save model: ${error.message}` };
    }
  });

  // IPC Handlers for get-test-results, get-model-code (NEED PATH UPDATES)
  ipcMain.handle('get-test-results', async () => {
    const resultsPath = path.join(RUN_OUTPUT_PATH, 'local_results.json');
    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    try {
      if (mainWindow) mainWindow.webContents.send('test-results-status', 'Fetching test results...');
      const data = await fs.readFile(resultsPath, 'utf-8');
      const jsonData = JSON.parse(data);
      if (mainWindow) mainWindow.webContents.send('test-results-status', 'Test results loaded.');
      return { success: true, data: jsonData };
    } catch (error) {
      console.error('IPC Error reading test results file:', error);
      let errorMessage = 'Failed to load test results.';
      if (error.code === 'ENOENT') {
        errorMessage = `Results file not found at ${resultsPath}. Run the model first.`;
      }
      if (mainWindow) mainWindow.webContents.send('test-results-status', `Error: ${errorMessage}`);
      return { success: false, error: errorMessage, data: null };
    }
  });

  ipcMain.handle('get-model-code', async () => {
    const modelCodePath = path.join(COMPILE_OUTPUT_PATH, 'PrimaryModel.py');
    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    try {
      if (mainWindow) mainWindow.webContents.send('model-code-status', 'Fetching model code...');
      const code = await fs.readFile(modelCodePath, 'utf-8');
      if (mainWindow) mainWindow.webContents.send('model-code-status', 'Model code loaded.');
      return { success: true, code: code };
    } catch (error) {
      console.error('IPC Error reading model code file:', error);
      let errorMessage = 'Failed to load model code.';
      if (error.code === 'ENOENT') {
        errorMessage = `Model code file not found at ${modelCodePath}. Compile the model first.`;
      }
      if (mainWindow) mainWindow.webContents.send('model-code-status', `Error: ${errorMessage}`);
      return { success: false, error: errorMessage, code: null };
    }
  });

  // ... (other IPC handlers like get-run-logs, generate-notebook, ensure-client-secrets if kept)
  // These would also need to use the VENV_PATH and appropriate DYNAMIC_DATA_ROOT_PATH subdirectories.

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});