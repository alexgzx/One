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
$oneProcs = Get-Process -Name "$appName" -ErrorAction SilentlyContinue
foreach ($proc in $oneProcs) {
    try {
        Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        Write-Host "  Killed $appName.exe PID=$($proc.Id)"
    } catch {}
}

# Step 2: Kill node.exe processes running One/cli.js
# Use Get-Process (more reliable than WMI in CI environments)
Write-Host "[One-Cleanup] Killing node.exe processes running One/cli.js..."
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
foreach ($proc in $nodeProcs) {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
        if ($cmdLine -and $cmdLine.ToLower() -match "one[/\\]cli\.js") {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "  Killed node.exe PID=$($proc.Id) (One/cli.js)"
        }
    } catch {}
}

# Step 3: Kill any process occupying port 20128
Write-Host "[One-Cleanup] Checking port $port..."
try {
    $netstatOutput = netstat -ano | findstr "LISTENING" | findstr ":$port"
    if ($netstatOutput) {
        $parts = $netstatOutput.Trim() -split '\s+'
        $procId = $parts[-1]
        if ($procId -match '^\d+$') {
            try {
                Stop-Process -Id ([int]$procId) -Force -ErrorAction Stop
                Write-Host "  Killed PID=$procId occupying port $port"
            } catch {
                Write-Host "  Failed to kill PID=$procId : $_"
            }
        }
    } else {
        Write-Host "  Port $port is free"
    }
} catch {
    Write-Host "  Port check failed: $_"
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
