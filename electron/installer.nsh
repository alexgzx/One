; ============================================================
; One NSIS Installer Hook - Pre-install Process Cleanup
; Included via electron-builder nsis.include = "installer.nsh"
; ============================================================

!macro customInit
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File "${PROJECT_DIR}\installer-cleanup.ps1"
!macroend

!macro customInstall
  ; Run the PowerShell cleanup script before installation
  nsExec::ExecToLog '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "$PLUGINSDIR\installer-cleanup.ps1"'
  Sleep 500
!macroend
