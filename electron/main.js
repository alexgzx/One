const { app, BrowserWindow, BrowserView, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
let browserView = null;
let tray = null;
let serverProcess = null;
let serverPort = 20128;
let isQuitting = false;

// BrowserView 布局变量（侧边栏宽度动态更新）
let sidebarWidth = 240;
const TOPBAR_HEIGHT = 96;  // 48px 顶栏 + 48px 返回按钮

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

/**
 * 获取托盘图标路径
 * 强制使用 assemblyai-color.png 派生的图标，缺失时抛错（无回退）
 */
function getIconPath() {
  const resourcePath = getResourcePath();
  const buildDir = path.join(resourcePath, 'build');
  const iconWin = path.join(buildDir, 'icon.ico');
  const iconMac = path.join(buildDir, 'icon-512.png');

  if (process.platform === 'win32') {
    if (!fs.existsSync(iconWin)) {
      const msg = `[Electron] Required tray icon not found: ${iconWin}. Build cannot proceed without assemblyai-color.png derived icon.`;
      console.error(msg);
      throw new Error(msg);
    }
    return iconWin;
  }

  // macOS / Linux
  if (!fs.existsSync(iconMac)) {
    const msg = `[Electron] Required tray icon not found: ${iconMac}. Build cannot proceed without assemblyai-color.png derived icon.`;
    console.error(msg);
    throw new Error(msg);
  }
  return iconMac;
}

// ===== BrowserView 管理 =====

/**
 * 创建 BrowserView 并加载指定 URL
 */
function createBrowserView(url) {
  if (!mainWindow) return;

  // 如果已存在 BrowserView，先关闭
  if (browserView) {
    closeBrowserView();
  }

  const bounds = mainWindow.getBounds();

  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    }
  });

  mainWindow.setBrowserView(browserView);

  // 设置 BrowserView 的 bounds（避开侧边栏和顶部栏）
  browserView.setBounds({
    x: sidebarWidth,
    y: TOPBAR_HEIGHT,
    width: bounds.width - sidebarWidth,
    height: bounds.height - TOPBAR_HEIGHT
  });

  // 加载 URL
  browserView.webContents.loadURL(url);

  console.log(`[BrowserView] Created and loading: ${url}`);
}

/**
 * 关闭 BrowserView
 */
function closeBrowserView() {
  if (browserView) {
    mainWindow.removeBrowserView(browserView);
    browserView.webContents.destroy();
    browserView = null;
    console.log('[BrowserView] Closed');
  }
}

/**
 * BrowserView 导航到新 URL
 */
function navigateBrowserView(url) {
  if (browserView) {
    browserView.webContents.loadURL(url);
    console.log(`[BrowserView] Navigated to: ${url}`);
  }
}

/**
 * 检查 BrowserView 是否可后退
 */
function canGoBackBrowserView() {
  if (browserView) {
    return browserView.webContents.canGoBack();
  }
  return false;
}

/**
 * BrowserView 后退
 */
function goBackBrowserView() {
  if (browserView && browserView.webContents.canGoBack()) {
    browserView.webContents.goBack();
    console.log('[BrowserView] Went back');
  }
}

/**
 * 更新 BrowserView 的 bounds（窗口大小变化时调用）
 */
function updateBrowserViewBounds() {
  if (browserView && mainWindow) {
    const bounds = mainWindow.getBounds();
    browserView.setBounds({
      x: sidebarWidth,
      y: TOPBAR_HEIGHT,
      width: bounds.width - sidebarWidth,
      height: bounds.height - TOPBAR_HEIGHT
    });
  }
}

// ===== 服务管理 =====

/**
 * 通过 HTTP 健康检查等待 server 就绪
 * 替代不可靠的 stdout 关键字匹配（CLI 输出中文/格式不固定）
 */
function waitForServerHealth(port, maxAttempts = 60, intervalMs = 1000) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkHealth = () => {
      attempts++;
      const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
        res.destroy();
        if (res.statusCode === 200) {
          console.log(`[Server] Health check passed (attempt ${attempts}/${maxAttempts})`);
          resolve();
        } else {
          retryOrFail(new Error(`Health check returned status ${res.statusCode}`));
        }
      });

      req.on('error', (err) => {
        retryOrFail(err);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        retryOrFail(new Error('Health check timeout'));
      });
    };

    const retryOrFail = (err) => {
      if (attempts >= maxAttempts) {
        reject(new Error(`Server failed to start after ${maxAttempts} attempts. Last error: ${err.message}`));
        return;
      }
      setTimeout(checkHealth, intervalMs);
    };

    // 首次检查延迟 1 秒，给 server 启动时间
    setTimeout(checkHealth, 1000);
  });
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

    serverProcess = spawn(nodePath, [
      cliPath,
      '--port', serverPort.toString(),
      '--no-browser',
      '--tray',
      '--no-tray'  // 阻止 CLI 创建托盘，由 Electron 自己管理
    ], {
      cwd: cliDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: serverPort.toString(),
        NODE_ENV: 'production'
      }
    });

    // 仅记录日志，不再依赖 stdout 关键字判断就绪
    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(`[Server] ${text.trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (err) => {
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (!isQuitting && code !== 0 && code !== null) {
        reject(new Error(`Server process exited with code ${code} before becoming ready`));
      }
    });

    // 通过 HTTP 健康检查等待 server 真正就绪（替代 stdout 关键字匹配）
    // 60 次 × 1 秒 = 最长等待 60 秒，覆盖 Next.js 首次启动编译时间
    waitForServerHealth(serverPort, 60, 1000).then(resolve).catch(reject);
  });
}

async function restartServer() {
  await stopServer();
  await startServer();
  if (mainWindow) {
    mainWindow.reload();
  }
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

// ===== 窗口管理 =====

function createMainWindow() {
  // 解析窗口图标
  let windowIconPath;
  try {
    windowIconPath = getIconPath();
  } catch (err) {
    console.error(err.message);
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'One',
    show: false,
    icon: windowIconPath,
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

  // 关闭按钮：仅隐藏到托盘
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // 窗口大小变化时更新 BrowserView bounds
  mainWindow.on('resize', () => {
    updateBrowserViewBounds();
  });

  // 窗口获得焦点时，BrowserView 也获得焦点
  mainWindow.on('focus', () => {
    if (browserView) {
      browserView.webContents.focus();
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

/**
 * 创建系统托盘
 */
function createTray() {
  // 解析托盘图标
  let trayIconPath;
  try {
    trayIconPath = getIconPath();
  } catch (err) {
    console.error(err.message);
    return;
  }

  tray = new Tray(trayIconPath);

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
        await restartServer();
      }
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: getAutoStartEnabled(),
      click: (menuItem) => {
        setAutoStartEnabled(menuItem.checked);
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

  tray.setToolTip('One - 端口 20128');
  tray.setContextMenu(contextMenu);

  // 双击托盘图标：显示/隐藏主窗口
  tray.on('double-click', () => {
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

/**
 * 查询当前开机自启状态
 */
function getAutoStartEnabled() {
  try {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  } catch (e) {
    return false;
  }
}

/**
 * 设置开机自启状态
 */
function setAutoStartEnabled(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      args: ['--hidden']
    });
    console.log(`[Electron] AutoStart set to: ${enabled}`);
  } catch (e) {
    console.error(`[Electron] Failed to set autoStart: ${e.message}`);
  }
}

// ===== IPC 处理器 =====

ipcMain.handle('get-server-port', () => serverPort);
ipcMain.handle('get-app-version', () => app.getVersion());

// BrowserView IPC 处理器
ipcMain.handle('browser-view:open', (event, url) => {
  createBrowserView(url);
  return { success: true };
});

ipcMain.handle('browser-view:close', () => {
  closeBrowserView();
  return { success: true };
});

ipcMain.handle('browser-view:navigate', (event, url) => {
  navigateBrowserView(url);
  return { success: true };
});

ipcMain.handle('browser-view:can-go-back', () => {
  return canGoBackBrowserView();
});

ipcMain.handle('browser-view:go-back', () => {
  goBackBrowserView();
  return { success: true };
});

ipcMain.handle('sidebar:set-width', (event, width) => {
  sidebarWidth = Math.max(68, Math.min(300, parseInt(width) || 240));
  updateBrowserViewBounds();
  return { success: true, width: sidebarWidth };
});

// ===== 应用生命周期 =====

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
  // 防止窗口全部关闭时退出进程，保留托盘后台运行
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