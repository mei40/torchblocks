export interface IElectronAPI {
  sendMessage: (channel: string, data: unknown) => void;
  onMessage: (channel: string, func: (...args: unknown[]) => void) => void;
  // Define other functions you'll add to preload.js here
  // getLogs: () => Promise<string>;
  installPythonEnv: () => Promise<{ success: boolean; message: string; log: string }>;
  onInstallPythonEnvProgress: (callback: (logMessage: string) => void) => void;
  onInstallPythonEnvStatus: (callback: (statusMessage: string) => void) => void;
  runCompileMain: (modelJsonPath: string) => Promise<{ success: boolean; message: string; log: string }>;
  onCompileMainProgress: (callback: (logMessage: string) => void) => void;
  onCompileMainStatus: (callback: (statusMessage: string) => void) => void;
  runRunMain: (epochs?: number) => Promise<{ success: boolean; message: string; log: string }>;
  onRunMainProgress: (callback: (logMessage: string) => void) => void;
  onRunMainStatus: (callback: (statusMessage: string) => void) => void;
  saveModelJson: (data: { jsonContent: string; filename: string }) => Promise<{ success: boolean; message: string; path?: string }>;
  getTestResults: () => Promise<{ success: boolean; data: ResultsData | null; error?: string; }>;
  onTestResultsStatus: (callback: (statusMessage: string) => void) => void;
  getModelCode: () => Promise<{ success: boolean; code: string | null; error?: string; }>;
  onModelCodeStatus: (callback: (statusMessage: string) => void) => void;
}

export interface ResultsData {
  losses: [number, number][];
  accuracies: [number, number][];
  // Add other fields if your local_results.json has them
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
