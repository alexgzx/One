#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use std::process::{Command, Child, Stdio};
use std::time::Duration;
use std::thread;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use dirs::home_dir;

struct ServerState {
    port: u16,
    child: Option<Child>,
}

impl Default for ServerState {
    fn default() -> Self {
        Self {
            port: 20128,
            child: None,
        }
    }
}

#[tokio::main]
async fn main() {
    let open_dashboard = CustomMenuItem::new("dashboard".to_string(), "打开控制台");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(open_dashboard)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let tray = SystemTray::new().with_menu(tray_menu);

    let server_state = tauri::State::new(Mutex::new(ServerState::default()));

    tauri::Builder::default()
        .manage(server_state)
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let windows = app.windows();
                if let Some(window) = windows.values().next() {
                    let _ = window.show();
                    let _ = window.set_focus();
                } else {
                    let _ = tauri::WindowBuilder::new(
                        app,
                        "main",
                        tauri::WindowUrl::App("dashboard".into())
                    )
                    .title("One")
                    .min_inner_size(800.0, 600.0)
                    .inner_size(1280.0, 800.0)
                    .build();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    let state = app.state::<Mutex<ServerState>>();
                    if let Ok(mut guard) = state.lock() {
                        if let Some(mut child) = guard.child.take() {
                            let _ = child.kill();
                        }
                    }
                    app.exit(0);
                }
                "dashboard" => {
                    let windows = app.windows();
                    if let Some(window) = windows.values().next() {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            let app_handle = app.handle().clone();
            let state = app.state::<Mutex<ServerState>>();

            // 获取资源目录
            let resource_dir = app
                .path_resolver()
                .resource_dir()
                .unwrap_or_else(|| std::env::current_dir().unwrap());

            println!("资源目录: {}", resource_dir.display());

            // 启动 Next.js server
            tauri::async_runtime::spawn(async move {
                if let Ok(mut guard) = state.lock() {
                    let node_path = resource_dir.join("node");
                    let cli_app = resource_dir.join("cli").join("app");

                    println!("Node 路径: {:?}", node_path);
                    println!("CLI 路径: {:?}", cli_app);

                    // 设置环境变量
                    let mut cmd = if cfg!(windows) {
                        let node_exe = node_path.join("node.exe");
                        Command::new(node_exe)
                    } else {
                        let node_bin = node_path.join("bin").join("node");
                        Command::new(node_bin)
                    };

                    let server_js = cli_app.join("server.js");
                    if server_js.exists() {
                        cmd.arg(server_js)
                            .current_dir(&cli_app)
                            .env("PORT", guard.port.to_string())
                            .env("NODE_ENV", "production")
                            .stdout(Stdio::null())
                            .stderr(Stdio::null());

                        match cmd.spawn() {
                            Ok(child) => {
                                guard.child = Some(child);
                                println!("服务器已启动，端口: {}", guard.port);
                                // 等待 server 启动
                                thread::sleep(Duration::from_secs(3));

                                // 打开主窗口
                                let _ = tauri::WindowBuilder::new(
                                    &app_handle,
                                    "main",
                                    tauri::WindowUrl::External(format!("http://localhost:{}/dashboard", guard.port).parse().unwrap())
                                )
                                .title("One")
                                .min_inner_size(800.0, 600.0)
                                .inner_size(1280.0, 800.0)
                                .build();
                            }
                            Err(e) => {
                                eprintln!("启动服务器失败: {}", e);
                            }
                        }
                    } else {
                        eprintln!("server.js 未找到: {:?}", server_js);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
