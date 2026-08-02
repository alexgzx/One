const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serverProcess = null;
let serverPort = 20128;
let isQuitting = false;

function getResourcePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath);
  }
  return path.join(__dirname, 'resources');
}

function getNodePath() {
  const nodePath = path.join(getResourcePath(), 'node', 'node.exe');
  if (fs.existsSync(nodePath)) {
    return nodePath;
  }
  const nodeBin = path.join(getResourcePath(), 'node', 'bin', 'node');
  if (fs.existsSync(nodeBin)) {
    return nodeBin;
  }
  return 'node';
}

function getCliPath() {
  return path.join(getResourcePath(), 'cli', 'cli.js');
}

function startServer() {
  return new Promise((resolve, reject) => {
    const nodePath = getNodePath();
    const cliPath = getCliPath();
    
    if (!fs.existsSync(cliPath)) {
      reject(new Error(`CLI not found at: ${cliPath}`));
      return;
    }

    const cliDir = path.dirname(cliPath);
    
    serverProcess = spawn(nodePath, [cliPath, '--port', serverPort.toString(), '--no-browser'], {
      cwd: cliDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: serverPort.toString(),
        NODE_ENV: 'production'
      }
    });

    let output = '';
    let timeout;

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`[Server] ${text.trim()}`);
      
      if (text.includes('Server started') || text.includes('listening') || text.includes('ready')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data.toString().trim()}`);
    });

    timeout = setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        resolve();
      } else {
        reject(new Error('Server failed to start'));
      }
    }, 15000);

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (!isQuitting) {
        console.log(`Server exited with code: ${code}`);
      }
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
        resolve();
      }, 2000);
    } else {
      resolve();
    }
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'One',
    show: false,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadURL(`http://localhost:${serverPort}`);
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`http://localhost:${serverPort}`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function getIconPath() {
  const resourcePath = getResourcePath();
  const iconWin = path.join(resourcePath, 'build', 'icon.ico');
  const iconMac = path.join(resourcePath, 'build', 'icon-512x512.png');
  
  if (process.platform === 'win32' && fs.existsSync(iconWin)) {
    return iconWin;
  }
  if (fs.existsSync(iconMac)) {
    return iconMac;
  }
  if (fs.existsSync(iconWin)) {
    return iconWin;
  }
  return null;
}

function createTray() {
  const iconPath = getIconPath();
  if (!iconPath) {
    console.warn('No icon found for tray');
    return;
  }

  tray = new Tray(iconPath);
  tray.setToolTip('One');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '重启服务',
      click: async () => {
        await stopServer();
        await startServer();
        if (mainWindow) {
          mainWindow.reload();
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: async () => {
        isQuitting = true;
        await stopServer();
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

app.whenReady().then(async () => {
  try {
    console.log('Starting One server...');
    await startServer();
    console.log('Server started successfully');
    
    createMainWindow();
    createTray();
  } catch (err) {
    console.error('Failed to start:', err);
    app.quit();
  }
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('before-quit', async () => {
  isQuitting = true;
  await stopServer();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

ipcMain.handle('get-server-port', () => serverPort);
ipcMain.handle('get-app-version', () => app.getVersion());
