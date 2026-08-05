const { app, BrowserWindow, BrowserView, Tray, Menu, ipcMain, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

// ===== 启动日志 =====
const LOG_DIR = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}
}
const LOG_FILE = path.join(LOG_DIR, `electron-${Date.now()}.log`);

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}

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
 * 优先使用 assemblyai-color.png 派生图标；缺失时记录警告并返回 null（由调用方降级处理）
 */
function getIconPath() {
  const resourcePath = getResourcePath();
  const buildDir = path.join(resourcePath, 'build');
  const iconWin = path.join(buildDir, 'icon.ico');
  const iconMac = path.join(buildDir, 'icon-512.png');

  if (process.platform === 'win32') {
    if (!fs.existsSync(iconWin)) {
      log(`[WARN] Tray icon not found: ${iconWin}. Using Electron default icon.`);
      return null;
    }
    return iconWin;
  }

  if (!fs.existsSync(iconMac)) {
    log(`[WARN] Tray icon not found: ${iconMac}. Using Electron default icon.`);
    return null;
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
      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
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

    log(`Starting server: node=${nodePath}, cli=${cliPath}`);
    log(`Resource path: ${getResourcePath()}`);

    const cliDir = path.dirname(cliPath);

    serverProcess = spawn(nodePath, [
      cliPath,
      '--port', serverPort.toString(),
      '--no-browser',
      '--tray',
      '--no-tray'
    ], {
      cwd: cliDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: serverPort.toString(),
        NODE_ENV: 'production'
      }
    });

    log(`Server process spawned (PID: ${serverProcess.pid})`);

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      log(`[Server] ${text.trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      log(`[Server Error] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (err) => {
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (!isQuitting && code !== 0 && code !== null) {
        reject(new Error(`Server process exited with code ${code} before becoming ready`));
      }
    });

    waitForServerHealth(serverPort, 120, 1000).then(resolve).catch(reject);
  });
}

async function restartServer() {
  log('Restarting server...');
  await stopServer();
  await startServer();
  if (mainWindow) {
    mainWindow.reload();
  }
  log('Server restarted');
}

function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess && !serverProcess.killed) {
      log(`Stopping server process PID=${serverProcess.pid}...`);
      serverProcess.kill('SIGTERM');
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          log('Force killing server process...');
          serverProcess.kill('SIGKILL');
          // 强制 Windows 下 taskkill
          if (process.platform === 'win32' && serverProcess.pid) {
            try {
              execSync(`taskkill /F /T /PID ${serverProcess.pid} 2>nul`, { stdio: 'ignore', shell: true, windowsHide: true, timeout: 3000 });
            } catch {}
          }
        }
        resolve();
      }, 2000);
    } else {
      resolve();
    }
  });
}

// ===== 窗口管理 =====

const LOADING_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>One</title>
<style>
  body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  .box{text-align:center}
  .spinner{width:48px;height:48px;border:3px solid #333;border-top-color:#e56a4a;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px}
  @keyframes spin{to{transform:rotate(360deg)}}
  h1{font-size:18px;margin:0 0 8px;font-weight:600}
  p{font-size:13px;color:#888;margin:0}
</style></head><body>
<div class="box"><div class="spinner"></div>
<h1>One 正在启动</h1><p>正在加载服务，请稍候...</p></div></body></html>`;

let loadingWindow = null;

function showLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 480,
    height: 280,
    frame: false,
    transparent: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  loadingWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(LOADING_HTML));
  loadingWindow.once('ready-to-show', () => {
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.show();
    }
  });
  loadingWindow.setMenuBarVisibility(false);
}

function hideLoadingWindow() {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    loadingWindow.close();
    loadingWindow = null;
  }
}

function createMainWindow() {
  const iconPath = getIconPath();

  const windowOptions = {
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'One',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  };

  if (iconPath) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadURL(`http://localhost:${serverPort}`);

  mainWindow.once('ready-to-show', () => {
    hideLoadingWindow();
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('resize', () => {
    updateBrowserViewBounds();
  });

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
  const iconPath = getIconPath();

  try {
    if (iconPath) {
      tray = new Tray(iconPath);
    } else {
      tray = new Tray(nativeImage.createEmpty());
    }
  } catch (err) {
    log(`[ERROR] Failed to create tray: ${err.message}`);
    return;
  }

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
    log(`AutoStart set to: ${enabled}`);
  } catch (e) {
    log(`[ERROR] Failed to set autoStart: ${e.message}`);
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

// 修复2：提供 BrowserView 状态查询，供 Header 检测是否需要显示关闭按钮
ipcMain.handle('browser-view:get-status', () => {
  return { active: !!browserView };
});

ipcMain.handle('sidebar:set-width', (event, width) => {
  sidebarWidth = Math.max(68, Math.min(300, parseInt(width) || 240));
  updateBrowserViewBounds();
  return { success: true, width: sidebarWidth };
});

// ===== 启动前清理 =====

/**
 * 强制关闭残留的 One 进程（CLI/旧版 Electron 等）
 */
function killStaleProcesses() {
  log('[Cleanup] Checking for stale One processes...');
  try {
    if (process.platform === 'win32') {
      // Windows: 使用 PowerShell 查找 node.exe 中运行 One/cli.js 的进程
      const psCmd = `powershell -NonInteractive -WindowStyle Hidden -Command "Get-WmiObject Win32_Process -Filter 'Name=\\"node.exe\\"' | Select-Object ProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation"`;
      const output = execSync(psCmd, { encoding: 'utf8', windowsHide: true, timeout: 5000 });
      const lines = output.split('\n').slice(1).filter(l => l.trim());
      let killed = 0;
      lines.forEach(line => {
        const cmd = line.toLowerCase();
        const isAppProcess =
          (cmd.includes('node') && (cmd.includes('one/cli.js') || cmd.includes('\\one\\') || cmd.includes('/one/')))
          || cmd.includes('next-server');
        if (isAppProcess) {
          const match = line.match(/^"(\d+)"/);
          if (match && match[1] && match[1] !== process.pid.toString()) {
            log(`[Cleanup] Killing stale process PID=${match[1]}`);
            try {
              execSync(`taskkill /F /PID ${match[1]} 2>nul`, { stdio: 'ignore', shell: true, windowsHide: true, timeout: 3000 });
              killed++;
            } catch {}
          }
        }
      });
      if (killed > 0) {
        log(`[Cleanup] Killed ${killed} stale process(es)`);
        // 等待端口释放
        execSync('timeout /t 2 /nobreak > nul', { stdio: 'ignore', shell: true, windowsHide: true, timeout: 3000 });
      } else {
        log('[Cleanup] No stale processes found');
      }
    } else {
      // macOS/Linux
      const output = execSync('ps aux 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
      const lines = output.split('\n');
      let killed = 0;
      lines.forEach(line => {
        const cmd = line.toLowerCase();
        const isAppProcess =
          (cmd.includes('node') && (cmd.includes('one/cli.js') || cmd.includes('/one/')))
          || cmd.includes('next-server');
        if (isAppProcess) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[1];
          if (pid && !isNaN(pid) && pid !== process.pid.toString()) {
            log(`[Cleanup] Killing stale process PID=${pid}`);
            try {
              execSync(`kill -9 ${pid} 2>/dev/null`, { stdio: 'ignore', timeout: 3000 });
              killed++;
            } catch {}
          }
        }
      });
      if (killed > 0) {
        log(`[Cleanup] Killed ${killed} stale process(es)`);
      }
    }
  } catch (err) {
    log(`[Cleanup] Error during stale process cleanup: ${err.message}`);
  }
}

/**
 * 检查端口是否被占用
 */
function checkPortAvailable(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', shell: true, windowsHide: true, timeout: 5000 }).trim();
      const lines = output.split('\n').filter(l => l.includes('LISTENING'));
      if (lines.length > 0) {
        const pid = lines[0].trim().split(/\s+/).pop();
        log(`[Port] Port ${port} is occupied by PID ${pid}`);
        return false;
      }
    } else {
      const pidOutput = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      if (pidOutput) {
        log(`[Port] Port ${port} is occupied by PID ${pidOutput}`);
        return false;
      }
    }
    log(`[Port] Port ${port} is available`);
    return true;
  } catch {
    return true;
  }
}

// ===== 应用生命周期 =====

app.whenReady().then(async () => {
  log('=== One Electron starting ===');
  log(`Platform: ${process.platform}, Arch: ${process.arch}`);
  log(`App version: ${app.getVersion()}`);
  log(`App path: ${app.getPath('exe')}`);
  log(`User data: ${app.getPath('userData')}`);
  log(`Logs: ${LOG_FILE}`);

  // 1. 清理残留进程
  killStaleProcesses();

  // 2. 检查端口
  const portAvailable = checkPortAvailable(serverPort);
  if (!portAvailable) {
    const choice = dialog.showErrorBox(
      '端口被占用',
      `端口 ${serverPort} 被其他程序占用。\n\n请关闭占用端口的程序后重试，或手动释放端口。\n\n日志位置：${LOG_FILE}`
    );
    log('[ERROR] Port occupied, cannot start');
    app.quit();
    return;
  }

  // 3. 显示启动加载界面
  showLoadingWindow();

  // 4. 启动服务
  try {
    log('Starting One server...');
    await startServer();
    log('Server started successfully');

    // 5. 创建窗口和托盘
    createMainWindow();
    createTray();
  } catch (err) {
    log(`[FATAL] Failed to start: ${err.message}`);
    log(err.stack || '');

    // 关闭加载窗口
    hideLoadingWindow();

    // 显示错误对话框
    dialog.showErrorBox(
      'One 启动失败',
      `无法启动 One 服务：\n\n${err.message}\n\n` +
      `可能的原因：\n` +
      `• 端口 ${serverPort} 被占用\n` +
      `• 必要文件缺失（请检查安装是否完整）\n` +
      `• 系统资源不足\n\n` +
      `详细日志：${LOG_FILE}`
    );
    app.quit();
  }
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('before-quit', async () => {
  isQuitting = true;
  log('App quitting, cleaning up...');
  await stopServer();
  // 额外等待子进程退出
  await new Promise(r => setTimeout(r, 500));
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});