#!/usr/bin/env node
/**
 * Desktop launcher — compiled with pkg to produce One.exe (Windows) / One (macOS).
 *
 * Determines the bundled portable Node.js and spawns the CLI with it.
 * macOS .app:  One.app/Contents/MacOS/One  →  ../Resources/one/node/bin/node
 * Windows exe: One.exe                      →  ./resources/node/node.exe
 */
const path = require("path");
const { spawn } = require("child_process");

const exeDir = path.dirname(process.execPath);
const isMacApp = process.platform === "darwin" && exeDir.endsWith("MacOS");

const baseDir = isMacApp
  ? path.resolve(exeDir, "../Resources/one")
  : path.resolve(exeDir, "resources");

const nodeName = process.platform === "win32" ? "node.exe" : "bin/node";
const nodePath = path.join(baseDir, "node", nodeName);
const cliPath = path.join(baseDir, "cli", "cli.js");

if (!require("fs").existsSync(nodePath)) {
  console.error("Error: bundled Node.js not found at", nodePath);
  process.exit(1);
}
if (!require("fs").existsSync(cliPath)) {
  console.error("Error: CLI not found at", cliPath);
  process.exit(1);
}

const args = process.argv.slice(2);
const child = spawn(nodePath, ["--max-old-space-size=6144", cliPath, ...args], {
  stdio: "inherit",
  env: { ...process.env },
  windowsHide: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});