$ErrorActionPreference = "Stop"

$proxyDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $proxyDir

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

docker compose up -d

Write-Host ""
Write-Host "Local proxy is starting."
Write-Host "Add this hosts entry if you have not already:"
Write-Host "127.0.0.1 focusflow.local"
Write-Host ""
Write-Host "Then open http://focusflow.local/ or http://focusflow.local/api/..."

