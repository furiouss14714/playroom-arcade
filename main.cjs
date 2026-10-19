const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');

function configureAutoUpdates() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'A Playroom Arcade update has downloaded. It will install when you close the app.'
    });
  });
  autoUpdater.on('error', (error) => {
    console.error('Playroom Arcade update check failed:', error);
  });
  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error('Playroom Arcade update check failed:', error);
  });
}

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

