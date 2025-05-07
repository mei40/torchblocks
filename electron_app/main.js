const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const url = require('url'); // Import the 'url' module
const { spawn } = require('child_process'); // Added for running external commands
const fs = require('fs').promises; // Added for file system operations
const fsSync = require('fs'); // For synchronous checks like existsSync

// At the very top of electron_app/main.js
process.on('uncaughtException', (error) => {
  console.error('Main Uncaught Exception:', error);
});

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

// Ensure directories exist (using synchronous fs for simplicity at startup)
if (!fsSync.existsSync(DYNAMIC_DATA_ROOT_PATH)) fsSync.mkdirSync(DYNAMIC_DATA_ROOT_PATH, { recursive: true });
if (!fsSync.existsSync(MODEL_CONFIG_PATH)) fsSync.mkdirSync(MODEL_CONFIG_PATH, { recursive: true });
if (!fsSync.existsSync(COMPILE_OUTPUT_PATH)) fsSync.mkdirSync(COMPILE_OUTPUT_PATH, { recursive: true });
if (!fsSync.existsSync(RUN_OUTPUT_PATH)) fsSync.mkdirSync(RUN_OUTPUT_PATH, { recursive: true });
// if (!fsSync.existsSync(GOOGLE_BUILD_PATH)) fsSync.mkdirSync(GOOGLE_BUILD_PATH, { recursive: true });

// Helper function to run a command and return a promise
function runCommand(command, args, cwd, customEnv = null, progressCallback, statusCallback, useShell = false) {
  return new Promise((resolve, reject) => {
    const options = { cwd, stdio: 'pipe' }; // Removed shell:true default
    if (customEnv) {
      options.env = { ...process.env, ...customEnv };
    }

    if (useShell) {
        if (process.platform === 'win32') {
            options.shell = process.env.ComSpec || 'cmd.exe';
        } else {
            options.shell = true; // Default shell for non-Windows
        }
    } else {
        options.shell = false;
    }

    if (statusCallback) statusCallback(`Executing: ${command} ${args.join(' ')} in ${cwd} (shell: ${options.shell})`);
    console.log(`Executing: ${command} ${args.join(' ')} in ${cwd} with options:`, options);

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
        const errorMsg = `Command failed with code ${code}: ${command} ${args.join(' ')}\nStderr: ${stderr}\nStdout: ${stdout}`;
        if (statusCallback) statusCallback(errorMsg);
        console.error(errorMsg); // Ensure full error is logged server-side
        reject(new Error(errorMsg));
      }
    });

    childProcess.on('error', (err) => {
      // This 'error' is for spawn itself, e.g., command not found (ENOENT)
      const errorMsg = `Command execution error for '${command}': ${err.message}`;
      if (statusCallback) statusCallback(errorMsg);
      console.error(errorMsg, err); // Log the original error object too
      reject(err); // err is already an Error object
    });
  });
}

function createWindow () {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    });
  
    /* ── CHANGED SECTION ──────────────────────────────────────────────── */
    const isDev = !app.isPackaged;
  
    // dev run  → torchblocks/frontend/out/index.html
    // prod run → app.asar/frontend/out/index.html
    const projectRoot = path.join(__dirname, '..'); // If main.js is electron_app/, then __dirname is .../electron_app
    const indexPath = isDev
      ? path.join(projectRoot, 'frontend', 'out', 'index.html')
      : path.join(app.getAppPath(), 'frontend', 'out', 'index.html');
  
    console.log('Project root determined as:', projectRoot);
    console.log('Attempting to load:', indexPath);
  
    win.webContents.on('did-fail-load',
      (_e, code, description, validatedURL, isMainFrame) => {
        console.error('did-fail-load:', code, description, validatedURL, isMainFrame);
        if (isMainFrame && validatedURL.startsWith('file://')){
            console.error(`Could not load: ${validatedURL}. Check if the file exists and paths are correct.`);
            console.error(`Ensure frontend is built (npm run build:frontend from project root) and output is in 'frontend/out'.`);
        }
      });
  
    win.webContents.on('did-finish-load', () => {
      console.log('Main window loaded successfully');
    });
  
    // Electron wraps the path in a proper file:// URL internally
    win.loadFile(indexPath);

  // mainWindow.webContents.openDevTools(); 
}

app.whenReady().then(() => {
  // --- TEMPORARILY COMMENT OUT PROTOCOL REGISTRATION ---
  /*
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, allowServiceWorkers: true } }
  ]);

  protocol.registerFileProtocol('app', (request, callback) => {
    let requestedPath = request.url.slice('app://.'.length);
    if (requestedPath.includes('?')) {
      requestedPath = requestedPath.split('?')[0];
    }
    let resolvedPath;
    const frontendOutDirName = 'frontend/out';
    if (app.isPackaged) {
      resolvedPath = path.join(app.getAppPath(), frontendOutDirName, requestedPath);
    } else {
      resolvedPath = path.join(__dirname, '..', frontendOutDirName, requestedPath);
    }
    const safeOutDir = app.isPackaged ? path.join(app.getAppPath(), frontendOutDirName) : path.join(__dirname, '..', frontendOutDirName);
    if (!path.normalize(resolvedPath).startsWith(path.normalize(safeOutDir))) {
        console.error(`[Custom Protocol] Blocked potentially unsafe path request: ${request.url} resolving to ${resolvedPath}`);
        return callback({ error: -6 });
    }
    console.log(`[Custom Protocol] Request: ${request.url} => Resolved Path: ${resolvedPath}`);
    callback({ path: resolvedPath });
  });
  */
  // --- END OF TEMPORARILY COMMENTED OUT SECTION ---

  createWindow();

  // IPC Handler for Python Environment Setup
  ipcMain.handle('install-python-env', async (event) => {
    const projectRootPathForReqs = path.join(__dirname, '..'); // torchblocks root
    const requirementsFilePath = path.join(projectRootPathForReqs, 'backend', 'requirements.txt');
    
    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;

    const sendStatusUpdate = (message) => {
      if (mainWindow) mainWindow.webContents.send('install-python-env-status', message);
      console.log(message);
    };
    const sendProgressUpdate = (logMsg) => {
      if (mainWindow) mainWindow.webContents.send('install-python-env-progress', logMsg);
    };

    let pythonCmd = 'python'; // Directly check for 'python'

    try {
      sendStatusUpdate('Step 1/4: Checking Python availability...');
      try {
        await runCommand(pythonCmd, ['--version'], projectRootPathForReqs, null, sendProgressUpdate, sendStatusUpdate, true);
        sendStatusUpdate('Python found.');
      } catch (error) {
        const pyNotFoundMsg = 'Python check failed. Ensure Python is installed and in PATH.';
        sendStatusUpdate(pyNotFoundMsg);
        console.error(pyNotFoundMsg, error);
        return { success: false, message: pyNotFoundMsg, log: error.message };
      }

      // Venv creation and pip install: useShell = true
      sendStatusUpdate(`Step 2/4: Creating virtual environment at: ${VENV_PATH} using ${pythonCmd}`);
      await runCommand(pythonCmd, ['-m', 'venv', VENV_PATH], USER_DATA_PATH, null, sendProgressUpdate, sendStatusUpdate, true);
      sendStatusUpdate('Virtual environment created.');

      let venvPythonExecutable = process.platform === 'win32' ? path.join(VENV_PATH, 'Scripts', 'python.exe') : path.join(VENV_PATH, 'bin', 'python');
      sendStatusUpdate(`Virtual environment Python executable: ${venvPythonExecutable}`);

      sendStatusUpdate(`Step 3/4: Installing dependencies from ${requirementsFilePath}...`);
      const installResult = await runCommand(
        venvPythonExecutable,
        ['-m', 'pip', 'install', '-r', requirementsFilePath],
        USER_DATA_PATH, 
        null, 
        sendProgressUpdate, 
        sendStatusUpdate,
        true // useShell = true for pip install
      );
      sendStatusUpdate('Step 4/4: Dependencies installed successfully.');
      
      return { success: true, message: 'Python environment setup complete!', log: installResult.stdout + '\n' + installResult.stderr };

    } catch (error) {
      const setupErrorMsg = `Error during Python environment setup: ${error.message}`;
      console.error('Critical error during Python environment setup:', error); // Log full error object
      sendStatusUpdate(setupErrorMsg);
      return { success: false, message: setupErrorMsg, log: error.stack };
    }
  });

  // IPC Handler for running compile_main.py
  ipcMain.handle('run-compile-main', async (event, modelJsonPathFromFrontend) => {
    const projectRoot = path.join(__dirname, '..');
    const compileScriptPath = path.join(projectRoot, 'backend', 'antlr', 'compile_main.py');
    const outputPrimaryModelPyPath = path.join(COMPILE_OUTPUT_PATH, 'PrimaryModel.py');

    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;
    const sendStatus = (message) => { if (mainWindow) mainWindow.webContents.send('compile-main-status', message); console.log(message); };
    const sendProgress = (logMsg) => { if (mainWindow) mainWindow.webContents.send('compile-main-progress', logMsg); };    
    const venvPythonExecutable = process.platform === 'win32' ? path.join(VENV_PATH, 'Scripts', 'python.exe') : path.join(VENV_PATH, 'bin', 'python');

    try {
      sendStatus('Step 1/3: Preparing output directory for compiled model...');
      await fs.mkdir(COMPILE_OUTPUT_PATH, { recursive: true });
      sendStatus('Output directory prepared.');

      // modelJsonPathFromFrontend is expected to be the path to the model.json saved by save-model-json IPC
      // which should be an absolute path now, or resolvable from projectRoot.
      // Let's assume modelJsonPathFromFrontend is absolute or correctly relative from projectRoot.
      const absoluteModelJsonPath = path.isAbsolute(modelJsonPathFromFrontend) ? modelJsonPathFromFrontend : path.join(projectRoot, modelJsonPathFromFrontend);

      sendStatus(`Step 2/3: Starting code generation (compile_main.py) for ${absoluteModelJsonPath}...`);
      // Python scripts: useShell = true
      const result = await runCommand(
        venvPythonExecutable, 
        [compileScriptPath, absoluteModelJsonPath, outputPrimaryModelPyPath], 
        path.join(projectRoot, 'backend', 'antlr'), // CWD for compile_main.py
        null, sendProgress, sendStatus, true
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
    const projectRoot = path.join(__dirname, '..');
    const runScriptPath = path.join(projectRoot, 'backend', 'local', 'run_main.py');
    const numEpochs = epochs || '2';
    const inputPrimaryModelPyPath = path.join(COMPILE_OUTPUT_PATH, 'PrimaryModel.py');
    const outputResultsJsonPath = path.join(RUN_OUTPUT_PATH, 'local_results.json');

    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.length > 0 ? windows[0] : null;
    const sendStatus = (message) => { if (mainWindow) mainWindow.webContents.send('run-main-status', message); console.log(message); };
    const sendProgress = (logMsg) => { if (mainWindow) mainWindow.webContents.send('run-main-progress', logMsg); };    
    const venvPythonExecutable = process.platform === 'win32' ? path.join(VENV_PATH, 'Scripts', 'python.exe') : path.join(VENV_PATH, 'bin', 'python');

    try {
      sendStatus('Step 1/3: Preparing directory for model training results...');
      await fs.mkdir(RUN_OUTPUT_PATH, { recursive: true });
      sendStatus('Results directory prepared.');

      sendStatus(`Step 2/3: Starting model training (run_main.py) for ${numEpochs} epochs...`);
      // Python scripts: useShell = true
      const result = await runCommand(
        venvPythonExecutable, 
        [runScriptPath, numEpochs.toString(), inputPrimaryModelPyPath, outputResultsJsonPath], 
        projectRoot, 
        null, sendProgress, sendStatus, true
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
    // filename will be 'model.json'
    // Save to MODEL_CONFIG_PATH (userData) and also return this path for compile_main to use.
    const targetDir = MODEL_CONFIG_PATH; // All dynamic data under userData as per current variable defs.
    const filePath = path.join(targetDir, filename);

    try {
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(filePath, jsonContent, 'utf-8');
      console.log(`Model saved via IPC to: ${filePath}`);
      // The 'run-compile-main' handler expects an absolute path or one resolvable from project root.
      // Providing absolute path to the saved model.json in userData seems simplest.
      return { success: true, message: `Model saved to ${filePath}`, path: filePath }; 
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

  ipcMain.handle('get-env-diagnostics', async (event) => {
    console.log('---- Electron Main Process Environment Diagnostics ----');
    const mainProcessPath = process.env.PATH;
    const mainProcessComSpec = process.env.ComSpec;
    console.log('Main Process process.env.PATH:', mainProcessPath);
    console.log('Main Process process.env.ComSpec:', mainProcessComSpec);

    // Attempt to list contents of a few common Python installation paths if on Windows
    // This is a long shot, just for extra info
    if (process.platform === 'win32') {
        const commonPathsToTry = [
            'C:\\Python312', 'C:\\Python311', 'C:\\Python310', 'C:\\Python39', 'C:\\Python38',
            path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'AppData\\Local\\Programs\\Python')
        ];
        for (const pth of commonPathsToTry) {
            try {
                const dirContents = fsSync.readdirSync(pth);
                console.log(`Contents of ${pth}:`, dirContents.join(', ') || '(empty)');
            } catch (e) {
                // console.log(`Could not read dir ${pth}: ${e.message}`);
            }
        }
    }
    return { path: mainProcessPath, comSpec: mainProcessComSpec };
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});