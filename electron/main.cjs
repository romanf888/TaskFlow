const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow;
let localServer;

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

// Start a lightweight local HTTP server for Electron to provide valid localhost origin for Firebase Auth
function startLocalServer(distDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || !reqPath) reqPath = '/index.html';

      let filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
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
      resolve({ server, port: PREFERRED_PORT });
    }).on('error', () => {
      // If 38241 is occupied, listen on any free port
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        resolve({ server, port: addr.port });
      });
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'TaskFlow Windows',
    backgroundColor: '#0c0e15',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Strip Electron from User-Agent so Google OAuth doesn't block with "disallowed_useragent"
  const defaultUA = mainWindow.webContents.getUserAgent();
  const cleanUA = defaultUA.replace(/Electron\/\S+\s?/, '');
  mainWindow.webContents.setUserAgent(cleanUA);

  // Allow and configure Google Auth popups
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        autoHideMenuBar: true,
        title: 'Connexion Google - TaskFlow Windows',
        width: 520,
        height: 650,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      },
    };
  });

  mainWindow.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.setUserAgent(cleanUA);
    childWindow.removeMenu();
  });

  // Load the built app via local HTTP server for Firebase Auth compatibility, or fall back to file://
  const distDir = path.join(__dirname, '../dist');
  const distHtmlPath = path.join(distDir, 'index.html');

  if (fs.existsSync(distHtmlPath)) {
    try {
      const { server, port } = await startLocalServer(distDir);
      localServer = server;
      mainWindow.loadURL(`http://localhost:${port}`);
    } catch (e) {
      console.warn('Local server failed, falling back to file://', e);
      mainWindow.loadFile(distHtmlPath);
    }
  } else {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      console.warn('Could not connect to localhost:3000');
    });
  }

  // Auto-updater
  try {
    const { autoUpdater } = require('electron-updater');
    if (autoUpdater && app.isPackaged) {
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    }
  } catch (err) {
    // Graceful fallback
  }
}

app.whenReady().then(createWindow);

app.on('before-quit', () => {
  if (localServer) {
    try {
      localServer.close();
    } catch {}
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
