const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // BrowserView 管理 - 用于 Vibe coding 等内嵌网页功能
  openBrowserView: (url) => ipcRenderer.invoke('browser-view:open', url),
  closeBrowserView: () => ipcRenderer.invoke('browser-view:close'),
  navigateBrowserView: (url) => ipcRenderer.invoke('browser-view:navigate', url),
  canGoBackBrowserView: () => ipcRenderer.invoke('browser-view:can-go-back'),
  goBackBrowserView: () => ipcRenderer.invoke('browser-view:go-back'),

  // 侧边栏宽度 - 用于 BrowserView 自适应
  setSidebarWidth: (width) => ipcRenderer.invoke('sidebar:set-width', width),
});