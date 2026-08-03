const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;
let serverPort = 20128;
let isQuitting = false;
// 开机自启状态（由 Electron 原生 API 管理，避免依赖 CLI 的 autostart.js）
let autostartEnabled = false;

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
 * 获取 Electron 模式下的托盘图标路径。
 * 强制使用 assemblyai-color.png 派生的图标，缺失时抛错（无回退）。
 * Windows 使用 icon.ico，macOS/Linux 使用 icon-512.png（与 CI release.yml 生成逻辑一致）。
 */
function getTrayIconPath() {
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

function startServer() {
  return new Promise((resolve, reject) => {
    const nodePath = getNodePath();
    const cliPath = getCliPath();

    if (!fs.existsSync(cliPath)) {
      reject(new Error(`CLI not found at: ${cliPath}`));
      return;
    }

    const cliDir = path.dirname(cliPath);

    // 解析托盘图标路径，传递给 CLI 子进程
    let trayIconPath;
    try {
      trayIconPath = getTrayIconPath();
    } catch (err) {
      // 图标缺失：拒绝启动，避免使用错误图标
      reject(err);
      return;
    }

    // 读取当前开机自启状态，传递给 CLI 子进程用于菜单渲染
    autostartEnabled = getAutoStartEnabled();

    serverProcess = spawn(nodePath, [cliPath, '--port', serverPort.toString(), '--no-browser'], {
      cwd: cliDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: serverPort.toString(),
        NODE_ENV: 'production',
        // Electron 模式标志：CLI 据此构建 Electron 风格菜单，并通过 stdout 转发托盘事件
        ONE_ELECTRON_MODE: '1',
        // 托盘图标路径：CLI 据此加载 assemblyai-color.png 派生图标
        ONE_TRAY_ICON_PATH: trayIconPath,
        // 开机自启状态：CLI 据此渲染菜单项 checked 状态
        ONE_AUTOSTART_ENABLED: autostartEnabled ? '1' : '0'
      }
    });

    let output = '';
    let timeout;

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`[Server] ${text.trim()}`);

      // 解析 CLI 子进程通过 stdout 转发的托盘事件
      // 格式：[TRAY]{JSON}\n
      parseTrayEvents(text);

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

/**
 * 解析 CLI 子进程通过 stdout 转发的托盘事件。
 * 事件格式：[TRAY]{JSON}\n
 * 支持的事件类型：
 *  - toggle-window: 双击托盘图标，切换主窗口显隐
 *  - show-window: 菜单"显示主窗口"，显示并聚焦主窗口
 *  - restart-server: 菜单"重启服务"，重启后端服务
 *  - autostart-toggle: 菜单"开机自启"，切换开机自启状态
 *  - quit: 菜单"退出"，退出整个应用
 */
function parseTrayEvents(text) {
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('[TRAY]')) continue;
    try {
      const jsonStr = trimmed.slice('[TRAY]'.length);
      const evt = JSON.parse(jsonStr);
      handleTrayEvent(evt);
    } catch (e) {
      // 忽略解析失败的行
    }
  }
}

/**
 * 处理来自 CLI 子进程的托盘事件。
 */
function handleTrayEvent(evt) {
  switch (evt.type) {
    case 'toggle-window':
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
      break;
    case 'show-window':
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
      break;
    case 'restart-server':
      restartServer();
      break;
    case 'autostart-toggle':
      setAutoStartEnabled(!!evt.enabled);
      break;
    case 'quit':
      isQuitting = true;
      stopServer().then(() => app.quit());
      break;
    default:
      console.warn(`[Electron] Unknown tray event: ${evt.type}`);
  }
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

function createMainWindow() {
  // 解析窗口图标（与托盘图标同源，缺失时抛错）
  let windowIconPath;
  try {
    windowIconPath = getTrayIconPath();
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

  // 关闭按钮：仅隐藏到托盘，不退出进程。
  // 此时仅保留 CLI 子进程的托盘图标，给用户"只打开了一个应用"的体验。
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

// ===== Electron 原生开机自启 =====
// 使用 app.setLoginItemSettings API，跨平台稳定，无需维护 VBS/plist/desktop 文件。

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
 * @param {boolean} enabled - 是否启用
 */
function setAutoStartEnabled(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      // Windows: 启用后通过启动菜单注册，args 用于让 Electron 启动时识别自启来源
      args: ['--hidden']
    });
    autostartEnabled = !!enabled;
    console.log(`[Electron] AutoStart set to: ${autostartEnabled}`);
  } catch (e) {
    console.error(`[Electron] Failed to set autoStart: ${e.message}`);
  }
}

// ===== 应用生命周期 =====

app.whenReady().then(async () => {
  try {
    console.log('Starting One server...');
    await startServer();
    console.log('Server started successfully');

    createMainWindow();
    // 注意：不再调用 createTray()
    // 系统托盘由 CLI 子进程创建，Electron 仅保留任务栏图标（主窗口）
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

ipcMain.handle('get-server-port', () => serverPort);
ipcMain.handle('get-app-version', () => app.getVersion());
