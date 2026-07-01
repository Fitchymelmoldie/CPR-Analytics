param (
    [string]$SourceFolder = ".",
    [string]$BackupFolder = "backups",
    [string]$Prefix = "bodyshop-dashboard"
)

# Ensure backup directory exists
if (-Not (Test-Path -Path $BackupFolder)) {
    New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "$Prefix-$Timestamp.zip"
$BackupFilePath = Join-Path -Path $BackupFolder -ChildPath $BackupFileName

Write-Host "Starting backup of $Prefix..."
Write-Host "Destination: $BackupFilePath"

# Create a temporary directory to copy files into (excluding node_modules)
$TempDir = Join-Path -Path $env:TEMP -ChildPath "backup_temp_$Timestamp"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

# Copy files excluding node_modules, dist, and the backups folder itself
Copy-Item -Path "$SourceFolder\*" -Destination $TempDir -Recurse -Force -Exclude "node_modules", "dist", "backups", ".git"

# Compress the temporary directory
Compress-Archive -Path "$TempDir\*" -DestinationPath $BackupFilePath -Force

# Clean up temp directory
Remove-Item -Path $TempDir -Recurse -Force

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
