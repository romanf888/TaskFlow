const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow;
let localServer;
let currentServerPort = 38241;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.taskflow': 'application/json',
};

// Start a lightweight local HTTP server for Electron
function startLocalServer(distDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // 1. Endpoint: Return Firebase Config
      if (req.url === '/api/firebase-config' && req.method === 'GET') {
        const configPath = path.join(__dirname, '../firebase-applet-config.json');
        if (fs.existsSync(configPath)) {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          fs.createReadStream(configPath).pipe(res);
          return;
        }
      }

      // 2. Endpoint: Receive Google Auth Token from browser
      if (req.url === '/api/auth-callback' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('google-auth-credential', data);
              // Focus main window back
              if (mainWindow.isMinimized()) mainWindow.restore();
              mainWindow.focus();
            }
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Private-Network': 'true',
            });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // CORS Pre-flight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Access-Control-Request-Private-Network',
          'Access-Control-Allow-Private-Network': 'true',
        });
        res.end();
        return;
      }

      // 3. Static Files
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || !reqPath) reqPath = '/index.html';

      let filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const publicFallback = path.join(__dirname, '../public', reqPath);
        if (fs.existsSync(publicFallback) && !fs.statSync(publicFallback).isDirectory()) {
          filePath = publicFallback;
        } else {
          filePath = path.join(distDir, 'index.html');
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('File read error');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        });
        res.end(data);
      });
    });

    const PREFERRED_PORT = 38241;
    server.listen(PREFERRED_PORT, '127.0.0.1', () => {
      currentServerPort = PREFERRED_PORT;
      resolve({ server, port: PREFERRED_PORT });
    }).on('error', () => {
      // Fallback port
      server.listen(0, '127.0.0.1', () => {
        currentServerPort = server.address().port;
        resolve({ server, port: currentServerPort });
      });
    });
  });
}

function setupAutoUpdater() {
  try {
    const { autoUpdater } = require('electron-updater');
    if (!autoUpdater) return;

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      mainWindow?.webContents.send('updater-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      mainWindow?.webContents.send('updater-status', { 
        status: 'available', 
        version: info?.version,
        releaseDate: info?.releaseDate 
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      mainWindow?.webContents.send('updater-status', { 
        status: 'not-available', 
        version: info?.version 
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      mainWindow?.webContents.send('updater-status', { 
        status: 'downloading', 
        percent: Math.round(progressObj.percent),
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('updater-status', { 
        status: 'downloaded', 
        version: info?.version 
      });
    });

    autoUpdater.on('error', (err) => {
      mainWindow?.webContents.send('updater-status', { 
        status: 'error', 
        error: err?.message || String(err) 
      });
    });

    // Check once at startup if packaged
    if (app.isPackaged) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch(() => {});
      }, 3000);
    }
  } catch (err) {
    console.warn('AutoUpdater init notice:', err.message);
  }
}

async function createWindow() {
  const appIconPath = path.join(__dirname, '../build/icon.png');
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'TaskFlow Workspace',
    icon: fs.existsSync(appIconPath) ? appIconPath : undefined,
    backgroundColor: '#131314',
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Strip Electron from User-Agent
  const defaultUA = mainWindow.webContents.getUserAgent();
  const cleanUA = defaultUA.replace(/Electron\/\S+\s?/, '');
  mainWindow.webContents.setUserAgent(cleanUA);

  // Load app via local HTTP server
  const distDir = path.join(__dirname, '../dist');
  const distHtmlPath = path.join(distDir, 'index.html');

  if (fs.existsSync(distHtmlPath)) {
    try {
      const { server, port } = await startLocalServer(distDir);
      localServer = server;
      mainWindow.loadURL(`http://localhost:${port}`);
    } catch (e) {
      mainWindow.loadFile(distHtmlPath);
    }
  } else {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      console.warn('Could not connect to localhost:3000');
    });
  }

  setupAutoUpdater();
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow?.close();
});

ipcMain.handle('is-maximized', () => {
  return mainWindow?.isMaximized() || false;
});

ipcMain.handle('open-external-browser-auth', () => {
  const localAuthUrl = `http://localhost:${currentServerPort}/login-browser.html?port=${currentServerPort}`;
  shell.openExternal(localAuthUrl);
  return true;
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const { autoUpdater } = require('electron-updater');
    if (!autoUpdater) return { status: 'error', error: 'Module non disponible' };
    
    mainWindow?.webContents.send('updater-status', { status: 'checking' });
    
    if (!app.isPackaged) {
      setTimeout(() => {
        mainWindow?.webContents.send('updater-status', { 
          status: 'not-available', 
          version: app.getVersion() 
        });
      }, 1000);
      return { status: 'dev-mode' };
    }

    const checkResult = await autoUpdater.checkForUpdates();
    return { status: 'checking', updateInfo: checkResult?.updateInfo };
  } catch (err) {
    mainWindow?.webContents.send('updater-status', { status: 'error', error: err.message });
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('quit-and-install-update', () => {
  try {
    const { autoUpdater } = require('electron-updater');
    if (autoUpdater) {
      autoUpdater.quitAndInstall();
    }
  } catch (err) {
    console.error('Failed to quit and install:', err);
  }
});

app.whenReady().then(createWindow);

app.on('before-quit', () => {
  if (localServer) {
    try { localServer.close(); } catch {}
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
