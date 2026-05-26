$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime"
$pidDir = Join-Path $runtimeDir "pids"
$sessionFile = Join-Path $runtimeDir "current-session.json"
$proxyDir = Join-Path $repoRoot "infra\local-proxy"

function Get-ChildProcessIds {
    param(
        [Parameter(Mandatory = $true)]
        [int] $ParentId
    )

    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentId" -ErrorAction SilentlyContinue
    $allChildIds = @()

    foreach ($child in $children) {
        $allChildIds += [int]$child.ProcessId
        $allChildIds += Get-ChildProcessIds -ParentId ([int]$child.ProcessId)
    }

    return $allChildIds
}

function Stop-ProcessTree {
    param(
        [Parameter(Mandatory = $true)]
        [int] $RootPid
    )

    $descendantIds = @(Get-ChildProcessIds -ParentId $RootPid | Select-Object -Unique)

    foreach ($childPid in ($descendantIds | Sort-Object -Descending)) {
        try {
            Stop-Process -Id $childPid -Force -ErrorAction Stop
            Write-Host "Stopped child PID $childPid"
        } catch {
        }
    }

    try {
        Stop-Process -Id $RootPid -Force -ErrorAction Stop
        Write-Host "Stopped PID $RootPid"
    } catch {
        Write-Host "PID $RootPid was not running"
    }
}

function Stop-ManagedProcess {
    param(
        [Parameter(Mandatory = $true)]
        [string] $PidFile
    )

    if (-not (Test-Path $PidFile)) {
        return
    }

    $pidValue = Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pidValue) {
        Stop-ProcessTree -RootPid ([int]$pidValue)
    }

    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

if (Test-Path $pidDir) {
    Get-ChildItem $pidDir -Filter *.pid | ForEach-Object {
        Stop-ManagedProcess -PidFile $_.FullName
    }
}

if (Test-Path $proxyDir) {
    Push-Location $proxyDir
    try {
        docker compose down
        Write-Host "Stopped local nginx proxy"
    } finally {
        Pop-Location
    }
}

if (Test-Path $sessionFile) {
    $sessionInfo = Get-Content $sessionFile -Raw | ConvertFrom-Json
    if ($sessionInfo.logDir) {
        Write-Host "Last session logs: $($sessionInfo.logDir)"
    }
    Remove-Item $sessionFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Local stack stopped."
