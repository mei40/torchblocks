const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example function: send a message to the main process
  sendMessage: (channel, data) => {
    // Whitelist channels
    const validChannels = ['to-main']; // Add more channels as needed
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Example function: receive a message from the main process
  onMessage: (channel, func) => {
    const validChannels = ['from-main']; // Add more channels as needed
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  installPythonEnv: () => ipcRenderer.invoke('install-python-env'),
  // For progress/status updates (optional but recommended)
  onInstallPythonEnvProgress: (callback) => ipcRenderer.on('install-python-env-progress', (_event, ...args) => callback(...args)),
  onInstallPythonEnvStatus: (callback) => ipcRenderer.on('install-python-env-status', (_event, ...args) => callback(...args)),
  // We will add more specific functions here later, e.g.,
  // getLogs: () => ipcRenderer.invoke('get-logs'),
  // runTests: (params) => ipcRenderer.invoke('run-tests', params),
  runCompileMain: (modelJsonPath) => ipcRenderer.invoke('run-compile-main', modelJsonPath),
  onCompileMainProgress: (callback) => ipcRenderer.on('compile-main-progress', (_event, ...args) => callback(...args)),
  onCompileMainStatus: (callback) => ipcRenderer.on('compile-main-status', (_event, ...args) => callback(...args)),
  runRunMain: (epochs) => ipcRenderer.invoke('run-run-main', epochs),
  onRunMainProgress: (callback) => ipcRenderer.on('run-main-progress', (_event, ...args) => callback(...args)),
  onRunMainStatus: (callback) => ipcRenderer.on('run-main-status', (_event, ...args) => callback(...args)),
  // IPC call for saving model JSON
  saveModelJson: (jsonData) => ipcRenderer.invoke('save-model-json', jsonData),

  // IPC call for fetching test results
  getTestResults: () => ipcRenderer.invoke('get-test-results'),
  onTestResultsStatus: (callback) => ipcRenderer.on('test-results-status', (_event, ...args) => callback(...args)),

  // IPC call for fetching model code
  getModelCode: () => ipcRenderer.invoke('get-model-code'),
  onModelCodeStatus: (callback) => ipcRenderer.on('model-code-status', (_event, ...args) => callback(...args)),
});

console.log('Preload script loaded.');
