#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use tauri::{
    CustomMenuItem, Manager, Runtime, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

struct ServerState {
    process: Arc<Mutex<Option<std::process::Child>>>,
    port: u16,
}

impl ServerState {
    fn new(port: u16) -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            port,
        }
    }

    fn start(&self) -> Result<(), String> {
        let mut process = self.process.lock().unwrap();
        
        if process.is_some() {
            return Ok(());
        }

        let resource_path = Self::get_resource_path();
        let node_path = Self::get_node_path(&resource_path);
        let cli_path = resource_path.join("cli").join("cli.js");

        eprintln!("Resource path: {:?}", resource_path);
        eprintln!("Node path: {:?}", node_path);
        eprintln!("CLI path: {:?}", cli_path);

        if !cli_path.exists() {
            return Err(format!("CLI not found at: {:?}", cli_path));
        }

        if !node_path.exists() {
            return Err(format!("Node not found at: {:?}", node_path));
        }

        let cli_dir = cli_path.parent().unwrap();

        let child = Command::new(&node_path)
            .arg(&cli_path)
            .arg("--port")
            .arg(self.port.to_string())
            .current_dir(cli_dir)
            .env("PORT", self.port.to_string())
            .env("NODE_ENV", "production")
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start server: {}", e))?;

        *process = Some(child);

        Ok(())
    }

    fn stop(&self) {
        let mut process = self.process.lock().unwrap();
        if let Some(child) = process.as_mut() {
            let _ = child.kill();
            let _ = child.wait();
        }
        *process = None;
    }

    fn get_resource_path() -> PathBuf {
        if cfg!(debug_assertions) {
            return PathBuf::from("resources");
        }

        let exe = env::current_exe()
            .unwrap_or_else(|_| PathBuf::from("."));

        // macOS .app bundle: exe = One.app/Contents/MacOS/One
        // Tauri bundles resources to: One.app/Contents/Resources/resources/
        #[cfg(target_os = "macos")]
        {
            if let Some(macos_dir) = exe.parent() {
                // macOS_dir = One.app/Contents/MacOS
                if let Some(contents_dir) = macos_dir.parent() {
                    // contents_dir = One.app/Contents
                    let res = contents_dir.join("Resources").join("resources");
                    if res.exists() {
                        return res;
                    }
                }
            }
        }

        // Windows / Linux: exe_dir/resources
        exe.parent()
            .map_or_else(|| PathBuf::from("."), |p| p.to_path_buf())
            .join("resources")
    }

    fn get_node_path(resource_path: &PathBuf) -> PathBuf {
        let node_win = resource_path.join("node").join("node.exe");
        if node_win.exists() {
            return node_win;
        }

        let node_mac = resource_path.join("node").join("bin").join("node");
        if node_mac.exists() {
            return node_mac;
        }

        PathBuf::from("node")
    }
}

impl Clone for ServerState {
    fn clone(&self) -> Self {
        Self {
            process: Arc::clone(&self.process),
            port: self.port,
        }
    }
}

pub fn run() {
    let server_state = ServerState::new(20128);
    
    if let Err(e) = server_state.start() {
        eprintln!("Failed to start server: {}", e);
    }

    let show_item = CustomMenuItem::new("show".to_string(), "显示主窗口");
    let restart_item = CustomMenuItem::new("restart".to_string(), "重启服务");
    let quit_item = CustomMenuItem::new("quit".to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(restart_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit_item);

    let system_tray = SystemTray::new()
        .with_tooltip("One")
        .with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::LeftClick { .. } | SystemTrayEvent::DoubleClick { .. } => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let server_state = server_state.clone();
                match id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "restart" => {
                        server_state.stop();
                        if let Err(e) = server_state.start() {
                            eprintln!("Failed to restart server: {}", e);
                        }
                        if let Some(window) = app.get_window("main") {
                            let _ = window.eval("window.location.reload()");
                        }
                    }
                    "quit" => {
                        server_state.stop();
                        app.exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .setup(|app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
