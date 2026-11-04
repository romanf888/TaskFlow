const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('quit-and-install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternalBrowserAuth: () => ipcRenderer.invoke('open-external-browser-auth'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  clearAppCache: () => ipcRenderer.invoke('clear-app-cache'),
  onUpdaterStatus: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('updater-status', subscription);
    return () => ipcRenderer.removeListener('updater-status', subscription);
  },
  onGoogleAuthCredential: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('google-auth-credential', subscription);
    return () => ipcRenderer.removeListener('google-auth-credential', subscription);
  },
});
