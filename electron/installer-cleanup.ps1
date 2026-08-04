# ============================================================
# One Installer Pre-cleanup Script
# Called by NSIS installer before installation to kill stale processes
# ============================================================

$ErrorActionPreference = "SilentlyContinue"
$appName = "One"
$port = 20128

Write-Host "[One-Cleanup] Starting pre-install process cleanup..."

# Step 1: Kill One.exe main process
Write-Host "[One-Cleanup] Killing $appName.exe processes..."
$oneProcs = Get-Process -Name "$appName*" -ErrorAction SilentlyContinue
foreach ($proc in $oneProcs) {
    try {
        Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        Write-Host "  Killed $appName.exe PID=$($proc.Id)"
    } catch {}
}

# Step 2: Kill node.exe processes running One/cli.js
Write-Host "[One-Cleanup] Killing node.exe processes running One/cli.js..."
$nodeProcs = Get-WmiObject Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
foreach ($proc in $nodeProcs) {
    $cmd = if ($proc.CommandLine) { $proc.CommandLine.ToLower() } else { "" }
    if ($cmd -match "one[/\\]cli\.js") {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            Write-Host "  Killed node.exe PID=$($proc.ProcessId) (One/cli.js)"
        } catch {}
    }
}

# Step 3: Kill any process occupying port 20128
Write-Host "[One-Cleanup] Checking port $port..."
$netstatOutput = netstat -ano | findstr "LISTENING" | findstr ":$port"
if ($netstatOutput) {
    $parts = $netstatOutput.Trim() -split '\s+'
    $pid = $parts[-1]
    if ($pid -match '^\d+$') {
        try {
            Stop-Process -Id ([int]$pid) -Force -ErrorAction Stop
            Write-Host "  Killed PID=$pid occupying port $port"
        } catch {
            Write-Host "  Failed to kill PID=$pid : $_"
        }
    }
} else {
    Write-Host "  Port $port is free"
}

# Step 4: Wait for file handles to be released
Start-Sleep -Seconds 3

# Step 5: Final verification
$finalCheck = netstat -ano | findstr "LISTENING" | findstr ":$port"
if ($finalCheck) {
    Write-Host "[One-Cleanup] WARNING: Port $port still occupied after cleanup"
} else {
    Write-Host "[One-Cleanup] Port $port is free. Ready to install."
}

Write-Host "[One-Cleanup] Done."
