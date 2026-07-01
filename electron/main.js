const { app, BrowserWindow, Tray, Menu, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let serverProcess;
const PORT = 20129; // 使用不同端口，避免和轻量版冲突

function getResourcePath() {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.join(__dirname, '..');
}

function startServer() {
  const resourcesPath = getResourcePath();
  const cliApp = path.join(resourcesPath, 'cli', 'app');
  const nodeBin = path.join(resourcesPath, 'node');

  console.log('资源目录:', resourcesPath);
  console.log('CLI 目录:', cliApp);

  let nodePath;
  if (process.platform === 'win32') {
    nodePath = path.join(nodeBin, 'node.exe');
  } else {
    nodePath = path.join(nodeBin, 'bin', 'node');
  }

  console.log('Node 路径:', nodePath);

  if (!fs.existsSync(nodePath)) {
    console.error('Node runtime not found:', nodePath);
    return;
  }

  const serverJs = path.join(cliApp, 'server.js');
  if (!fs.existsSync(serverJs)) {
    console.error('server.js not found:', serverJs);
    return;
  }

  serverProcess = spawn(nodePath, [serverJs], {
    cwd: cliApp,
    env: {
      ...process.env,
      PORT: PORT.toString(),
      NODE_ENV: 'production'
    },
    detached: false,
    windowsHide: true
  });

  serverProcess.on('error', (err) => {
    console.error('Server error:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log('Server exited with code:', code);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'One',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadURL(`http://localhost:${PORT}/dashboard`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 拦截外部链接，用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, 'icons', 'icon.ico')
    : path.join(__dirname, 'icons', 'icon.png');

  if (!fs.existsSync(iconPath)) {
    console.warn('Tray icon not found:', iconPath);
    return;
  }

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开控制台',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('One');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      createWindow();
    }
  });
}

app.whenReady().then(() => {
  // 延迟启动，确保端口释放
  setTimeout(() => {
    startServer();
  }, 500);

  // 等待服务器启动
  setTimeout(() => {
    createWindow();
    createTray();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // macOS：不退出，保留在托盘
  if (process.platform !== 'darwin') {
    // 不退出，隐藏到托盘
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
