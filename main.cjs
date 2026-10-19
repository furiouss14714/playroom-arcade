const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');

function configureAutoUpdates() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on('checking-for-update', () => sendUpdateStatus({ state: 'checking' }));
  autoUpdater.on('update-available', (info) => sendUpdateStatus({ state: 'available', version: info.version }));
  autoUpdater.on('update-not-available', () => sendUpdateStatus({ state: 'latest' }));
  autoUpdater.on('download-progress', (progress) => sendUpdateStatus({ state: 'downloading', percent: Math.round(progress.percent) }));
  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus({ state: 'installing', version: info.version });
    setTimeout(() => autoUpdater.quitAndInstall(true, true), 700);
  });
  autoUpdater.on('error', (error) => {
    console.error('Playroom Arcade update check failed:', error);
  });
  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Playroom Arcade update check failed:', error);
  });
}

function sendUpdateStatus(status) {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) window.webContents.send('updates:status', status);
  }
}

ipcMain.handle('updates:check', async () => {
  if (!app.isPackaged) return { state: 'unavailable' };
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!result || result.isUpdateAvailable === false) return { state: 'latest' };
    return { state: 'checking' };
  } catch (error) {
    console.error('Playroom Arcade update check failed:', error);
    return { state: 'error' };
  }
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    title: 'Playroom Arcade',
    backgroundColor: '#f3f1e9',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: [`--app-version=${app.getVersion()}`],
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.loadFile(path.join(__dirname, 'index.html'));
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  configureAutoUpdates();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

