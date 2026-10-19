const { contextBridge, ipcRenderer } = require('electron');

const versionArgument = process.argv.find((argument) => argument.startsWith('--app-version='));
const version = versionArgument ? versionArgument.slice('--app-version='.length) : 'unknown';

contextBridge.exposeInMainWorld('playroomApp', Object.freeze({
  version,
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  onUpdateStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('updates:status', listener);
    return () => ipcRenderer.removeListener('updates:status', listener);
  }
}));

