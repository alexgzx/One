const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

let trayInstance = null;
let isWinTray = false;

// ===== Electron 模式检测 =====
// 当通过 Electron 主进程 spawn 时，会设置 ONE_ELECTRON_MODE=1 环境变量。
// 该模式下，托盘事件不直接执行，而是通过 stdout JSON 转发给 Electron 主进程。
const isElectronMode = process.env.ONE_ELECTRON_MODE === "1";
// Electron 模式下的图标路径（由 Electron 主进程通过环境变量传入）
const electronIconPath = process.env.ONE_TRAY_ICON_PATH || "";

/**
 * 向 Electron 主进程发送托盘事件（仅 Electron 模式有效）。
 * 事件通过 stdout 写入，格式为 `[TRAY]{JSON}\n`，便于 Electron 侧解析。
 * @param {string} type - 事件类型：toggle-window / show-window / restart-server / quit / autostart-toggle
 * @param {Object} [extra] - 附加字段
 */
function emitTrayEvent(type, extra) {
  if (!isElectronMode) return;
  try {
    const payload = JSON.stringify(Object.assign({ type }, extra || {}));
    process.stdout.write(`[TRAY]${payload}\n`);
  } catch (e) {}
}

/**
 * Get icon base64 from file — used for systray (mac/linux)
 * Electron 模式下优先使用 ONE_TRAY_ICON_PATH 指定的图标。
 */
function getIconBase64() {
  const isWin = process.platform === "win32";
  // Electron 模式：优先使用外部指定的图标
  if (isElectronMode && electronIconPath) {
    try {
      if (fs.existsSync(electronIconPath)) {
        return fs.readFileSync(electronIconPath).toString("base64");
      }
    } catch (e) {}
  }
  // CLI 轻量版：使用内置图标
  const iconFile = isWin ? "icon.ico" : "icon.png";
  try {
    const iconPath = path.join(__dirname, iconFile);
    if (fs.existsSync(iconPath)) {
      return fs.readFileSync(iconPath).toString("base64");
    }
  } catch (e) {}
  // Fallback: minimal green dot icon (PNG)
  return "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAHpJREFUOE9jYBgFgwEwMjIy/Gdg+P8fyP4PxP8ZGBgEcBnGyMjIsICBgSEAhyH/gfgBUNN8XJoZsdkCVL8Ah+b/QPwbqvkBMvk/AwMDAzYX/GdgYAhAN+A/SICRWAMYGfFEJSMjzriEiwDR/xmIa2RkZCSqnZERb3QCAAo3KxzxbKe1AAAAAElFTkSuQmCC";
}

/**
 * Resolve Windows icon path.
 * Electron 模式下优先使用 ONE_TRAY_ICON_PATH；CLI 轻量版使用内置 icon.ico。
 */
function getWindowsIconPath() {
  if (isElectronMode && electronIconPath) {
    if (fs.existsSync(electronIconPath)) {
      return electronIconPath;
    }
  }
  return path.join(__dirname, "icon.ico");
}

/**
 * Check if system tray is supported on current OS
 */
function isTraySupported() {
  const platform = process.platform;
  if (!["darwin", "win32", "linux"].includes(platform)) {
    return false;
  }
  if (platform === "linux" && !process.env.DISPLAY) {
    return false;
  }
  return true;
}

/**
 * Initialize system tray with menu
 * @param {Object} options - { port, onQuit, onOpenDashboard, onShowWindow, onToggleWindow, onRestartServer, onAutostartToggle }
 * @returns {Object|null} tray instance or null if not supported/failed
 */
function initTray(options) {
  if (!isTraySupported()) {
    return null;
  }

  // Windows uses PowerShell NotifyIcon (AV-safe), others use systray
  if (process.platform === "win32") {
    return initWindowsTray(options);
  }
  return initUnixTray(options);
}

// ===== 菜单索引定义 =====
// CLI 模式: STATUS(0) / DASHBOARD(1) / AUTOSTART(2) / QUIT(3)
// Electron 模式: SHOW_WINDOW(0) / RESTART(1) / AUTOSTART(2) / QUIT(3)
const MENU_INDEX_CLI = { STATUS: 0, DASHBOARD: 1, AUTOSTART: 2, QUIT: 3 };
const MENU_INDEX_ELECTRON = { SHOW_WINDOW: 0, RESTART: 1, AUTOSTART: 2, QUIT: 3 };

/**
 * Build menu items array — 根据模式构建不同菜单
 * @param {number} port - 服务端口
 * @param {boolean} autostartEnabled - 开机自启状态
 * @param {boolean} electronMode - 是否为 Electron 模式
 */
function buildMenuItems(port, autostartEnabled, electronMode) {
  if (electronMode) {
    return [
      { title: "显示主窗口", tooltip: "显示 Electron 主窗口", enabled: true, checked: false },
      { title: "重启服务", tooltip: "重启后端服务", enabled: true, checked: false },
      {
        title: "开机自启",
        tooltip: "随系统开机启动",
        enabled: true,
        checked: autostartEnabled
      },
      { title: "退出", tooltip: "停止服务并退出", enabled: true, checked: false }
    ];
  }
  // CLI 轻量版菜单（保持原样）
  return [
    { title: `One（端口 ${port}）`, tooltip: "服务运行中", enabled: false, checked: false },
    { title: "打开控制台", tooltip: "在浏览器中打开", enabled: true, checked: false },
    {
      title: "开机自启",
      tooltip: "随系统开机启动",
      enabled: true,
      checked: autostartEnabled
    },
    { title: "退出", tooltip: "停止服务并退出", enabled: true, checked: false }
  ];
}

/**
 * Get current autostart state.
 * Electron 模式下开机自启由 Electron 原生 API 管理，状态通过环境变量传入。
 */
function getAutostartEnabled() {
  if (isElectronMode) {
    return process.env.ONE_AUTOSTART_ENABLED === "1";
  }
  try {
    const { isAutoStartEnabled } = require("./autostart");
    return isAutoStartEnabled();
  } catch (e) {
    return false;
  }
}

/**
 * Handle menu item click (shared logic)
 * @param {number} index - 菜单项索引
 * @param {Object} options - 调用方传入的回调
 * @param {Function} onAutostartToggle - 自启状态切换后的回调
 */
function handleClick(index, options, onAutostartToggle) {
  const { onQuit, onOpenDashboard, port } = options;

  if (isElectronMode) {
    // Electron 模式：菜单事件转发给 Electron 主进程处理
    const idx = MENU_INDEX_ELECTRON;
    if (index === idx.SHOW_WINDOW) {
      emitTrayEvent("show-window");
    } else if (index === idx.RESTART) {
      emitTrayEvent("restart-server");
    } else if (index === idx.AUTOSTART) {
      const newEnabled = !getAutostartEnabled();
      emitTrayEvent("autostart-toggle", { enabled: newEnabled });
      // 通知本地更新菜单项 checked 状态
      if (onAutostartToggle) onAutostartToggle(newEnabled);
    } else if (index === idx.QUIT) {
      emitTrayEvent("quit");
      console.log("\n👋 正在退出 ...");
      if (onQuit) onQuit();
      killTray();
      setTimeout(() => process.exit(0), 500);
    }
    return;
  }

  // CLI 轻量版逻辑（保持原样）
  if (index === MENU_INDEX_CLI.DASHBOARD) {
    if (onOpenDashboard) onOpenDashboard();
    else openBrowser(`http://localhost:${port}/dashboard`);
  } else if (index === MENU_INDEX_CLI.AUTOSTART) {
    const enabled = getAutostartEnabled();
    try {
      const { enableAutoStart, disableAutoStart } = require("./autostart");
      if (enabled) disableAutoStart();
      else enableAutoStart();
      onAutostartToggle(!enabled);
    } catch (e) {}
  } else if (index === MENU_INDEX_CLI.QUIT) {
    console.log("\n👋 正在退出 ...");
    if (onQuit) onQuit();
    killTray();
    setTimeout(() => process.exit(0), 500);
  }
}

/**
 * Windows tray via PowerShell NotifyIcon
 */
function initWindowsTray(options) {
  const { port } = options;
  try {
    const { initWinTray } = require("./trayWin");
    const iconPath = getWindowsIconPath();
    const autostartEnabled = getAutostartEnabled();
    const items = buildMenuItems(port, autostartEnabled, isElectronMode);

    trayInstance = initWinTray({
      iconPath,
      tooltip: `One - 端口 ${port}`,
      items,
      onClick: (index) => {
        handleClick(index, options, (newEnabled) => {
          trayInstance.updateItem(MENU_INDEX_ELECTRON.AUTOSTART, "开机自启", true, newEnabled);
        });
      },
      onDoubleClick: () => {
        // Windows 双击：Electron 模式切换窗口显隐；CLI 模式无操作
        if (isElectronMode) {
          emitTrayEvent("toggle-window");
        }
      }
    });

    isWinTray = true;
    return trayInstance;
  } catch (err) {
    return null;
  }
}

/**
 * macOS/Linux tray via systray binary
 */
function resolveSystray() {
  let runtimeDir = null;
  try {
    const { getRuntimeNodeModules } = require("../../../hooks/sqliteRuntime");
    runtimeDir = getRuntimeNodeModules();
  } catch (e) {}

  if (runtimeDir) {
    try { return { mod: require(path.join(runtimeDir, "systray2")).default, isV2: true }; } catch (e) {}
  }
  try { return { mod: require("systray2").default, isV2: true }; } catch (e) {}
  try { return { mod: require("systray").default, isV2: false }; } catch (e) {}
  if (runtimeDir) {
    try { return { mod: require(path.join(runtimeDir, "systray")).default, isV2: false }; } catch (e) {}
  }
  return null;
}

function chmodTrayBin(pkgName) {
  try {
    const { getRuntimeNodeModules } = require("../../../hooks/sqliteRuntime");
    const binName = process.platform === "darwin" ? "tray_darwin_release" : "tray_linux_release";
    const candidates = [
      path.join(getRuntimeNodeModules(), pkgName, "traybin", binName),
      path.join(__dirname, "..", "..", "..", "node_modules", pkgName, "traybin", binName)
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) fs.chmodSync(p, 0o755);
    }
  } catch (e) {}
}

// ===== Unix 双击检测状态 =====
// systray2 仅暴露 click 事件，需用时间窗口区分单击与双击。
const DBLCLICK_THRESHOLD_MS = 300;
let lastClickTime = 0;
let dblClickTimer = null;

function initUnixTray(options) {
  const { port } = options;
  try {
    const resolved = resolveSystray();
    if (!resolved) return null;
    const { mod: SysTray, isV2 } = resolved;

    chmodTrayBin(isV2 ? "systray2" : "systray");

    const autostartEnabled = getAutostartEnabled();
    const items = buildMenuItems(port, autostartEnabled, isElectronMode);

    const menu = {
      icon: getIconBase64(),
      isTemplateIcon: false,
      title: "",
      tooltip: `One - 端口 ${port}`,
      items
    };

    trayInstance = new SysTray({ menu, debug: false, copyDir: true });
    isWinTray = false;

    trayInstance.onClick((action) => {
      // ===== Electron 模式：双击检测 =====
      // systray2 在 macOS 上的 click 事件 seq_id 为 -1 时表示空白区域点击，
      // 即用户点击了图标本身而非菜单项。用此信号检测双击。
      if (isElectronMode && (action.seq_id === undefined || action.seq_id < 0)) {
        const now = Date.now();
        if (now - lastClickTime < DBLCLICK_THRESHOLD_MS) {
          // 双击：取消单击定时器，触发双击事件
          if (dblClickTimer) {
            clearTimeout(dblClickTimer);
            dblClickTimer = null;
          }
          emitTrayEvent("toggle-window");
          lastClickTime = 0;
          return;
        }
        // 第一次点击：等待 DBLCLICK_THRESHOLD_MS，无第二次点击则视为单击
        lastClickTime = now;
        if (dblClickTimer) clearTimeout(dblClickTimer);
        dblClickTimer = setTimeout(() => {
          dblClickTimer = null;
          // 单击不触发任何操作（与 macOS 原生行为一致）
        }, DBLCLICK_THRESHOLD_MS);
        return;
      }

      // 普通菜单项点击：走共享处理逻辑
      handleClick(action.seq_id, options, (newEnabled) => {
        trayInstance.sendAction({
          type: "update-item",
          item: {
            title: "开机自启",
            tooltip: "随系统开机启动",
            enabled: true,
            checked: newEnabled
          },
          seq_id: isElectronMode ? MENU_INDEX_ELECTRON.AUTOSTART : MENU_INDEX_CLI.AUTOSTART
        });
      });
    });

    if (isV2) {
      trayInstance.ready().catch((err) => {
        process.stderr.write(`[One] tray failed to start: ${err && err.message ? err.message : err}\n`);
      });
    } else {
      trayInstance.onReady(() => {});
      trayInstance.onError(() => {});
    }

    return trayInstance;
  } catch (err) {
    process.stderr.write(`[One] tray init error: ${err.message}\n`);
    return null;
  }
}

/**
 * Kill tray, wait Go binary fully exit (returns Promise).
 */
function killTray() {
  const instance = trayInstance;
  const wasWin = isWinTray;
  trayInstance = null;
  if (!instance) return Promise.resolve();

  if (wasWin) {
    try { instance.kill(); } catch (e) {}
    return Promise.resolve();
  }

  let proc = null;
  try {
    proc = instance._process || (typeof instance.process === "function" ? instance.process() : null);
  } catch (e) {}

  const gracefulQuit = () => { try { instance.kill(true); } catch (e) {} };
  const closeIpc = () => { try { instance.kill(false); } catch (e) {} };

  if (!proc || !proc.pid) {
    gracefulQuit();
    closeIpc();
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (done) return; done = true; closeIpc(); resolve(); };

    proc.once("exit", finish);
    gracefulQuit();

    setTimeout(() => { try { process.kill(proc.pid, 0); proc.kill("SIGTERM"); } catch (e) {} }, 800);
    setTimeout(() => { try { process.kill(proc.pid, 0); proc.kill("SIGKILL"); } catch (e) {} }, 1600);

    const deadline = Date.now() + 3000;
    const poll = setInterval(() => {
      try { process.kill(proc.pid, 0); } catch { clearInterval(poll); finish(); return; }
      if (Date.now() > deadline) { clearInterval(poll); finish(); }
    }, 50);
  });
}

/**
 * Open browser (仅 CLI 轻量版使用)
 */
function openBrowser(url) {
  const platform = process.platform;
  let cmd;

  if (platform === "darwin") {
    cmd = `open "${url}"`;
  } else if (platform === "win32") {
    cmd = `start "" "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }

  exec(cmd);
}

module.exports = {
  initTray,
  killTray
};
