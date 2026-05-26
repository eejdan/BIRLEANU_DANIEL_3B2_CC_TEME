$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $repoRoot ".runtime"
$pidDir = Join-Path $runtimeDir "pids"
$logsRootDir = Join-Path $runtimeDir "logs"
$runTimestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logDir = Join-Path $logsRootDir $runTimestamp
$sessionFile = Join-Path $runtimeDir "current-session.json"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
New-Item -ItemType Directory -Force -Path $pidDir | Out-Null
New-Item -ItemType Directory -Force -Path $logsRootDir | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Test-ManagedProcessRunning {
    param(
        [Parameter(Mandatory = $true)]
        [string] $PidFile
    )

    if (-not (Test-Path $PidFile)) {
        return $false
    }

    $pidValue = Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $pidValue) {
        return $false
    }

    try {
        $null = Get-Process -Id ([int]$pidValue) -ErrorAction Stop
        return $true
    } catch {
        Remove-Item $PidFile -ErrorAction SilentlyContinue
        return $false
    }
}

function Start-ManagedProcess {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $WorkingDirectory,

        [Parameter(Mandatory = $true)]
        [string] $Executable,

        [Parameter(Mandatory = $false)]
        [string[]] $Arguments = @()
    )

    $pidFile = Join-Path $pidDir "$Name.pid"
    $stdoutLog = Join-Path $logDir "$Name.out.log"
    $stderrLog = Join-Path $logDir "$Name.err.log"

    if (Test-ManagedProcessRunning -PidFile $pidFile) {
        $existingPid = Get-Content $pidFile | Select-Object -First 1
        Write-Host "$Name is already running with PID $existingPid"
        return
    }

    if (Test-Path $stdoutLog) {
        Remove-Item $stdoutLog -Force
    }

    if (Test-Path $stderrLog) {
        Remove-Item $stderrLog -Force
    }

    $process = Start-Process `
        -FilePath $Executable `
        -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru

    Set-Content -Path $pidFile -Value $process.Id
    Write-Host "Started $Name with PID $($process.Id)"
}

$services = @(
    @{
        Name = "auth"
        WorkingDirectory = (Join-Path $repoRoot "backend\FFLOW.BACKEND.AUTH")
        Executable = "node"
        Arguments = @("index.js")
    },
    @{
        Name = "calendar"
        WorkingDirectory = (Join-Path $repoRoot "backend\FFLOW.BACKEND.CALENDAR")
        Executable = "node"
        Arguments = @("index.js")
    },
    @{
        Name = "recommendations"
        WorkingDirectory = (Join-Path $repoRoot "backend\FFLOW.BACKEND.RECOMMENDATIONS")
        Executable = "node"
        Arguments = @("index.js")
    },
    @{
        Name = "billing"
        WorkingDirectory = (Join-Path $repoRoot "backend\FFLOW.BACKEND.BILLING")
        Executable = "node"
        Arguments = @("index.js")
    },
    @{
        Name = "advertising"
        WorkingDirectory = (Join-Path $repoRoot "backend\FFLOW.BACKEND.ADVERTISING")
        Executable = "node"
        Arguments = @("index.js")
    },
    @{
        Name = "dbseeder"
        WorkingDirectory = (Join-Path $repoRoot "backend\FFLOW.BACKEND.DBSEEDER")
        Executable = "node"
        Arguments = @("index.js")
    },
    @{
        Name = "frontend-web"
        WorkingDirectory = (Join-Path $repoRoot "frontend")
        Executable = "npm.cmd"
        Arguments = @("run", "web", "--", "--port", "8081")
    }
)

foreach ($service in $services) {
    Start-ManagedProcess `
        -Name $service.Name `
        -WorkingDirectory $service.WorkingDirectory `
        -Executable $service.Executable `
        -Arguments $service.Arguments
}

$proxyDir = Join-Path $repoRoot "infra\local-proxy"
$proxyEnvFile = Join-Path $proxyDir ".env"
$proxyEnvExample = Join-Path $proxyDir ".env.example"

if (-not (Test-Path $proxyEnvFile)) {
    Copy-Item $proxyEnvExample $proxyEnvFile
    Write-Host "Created infra/local-proxy/.env from .env.example"
}

Push-Location $proxyDir
try {
    docker compose up -d
    Write-Host "Started local nginx proxy"
} finally {
    Pop-Location
}

$sessionInfo = @{
    startedAt = (Get-Date).ToString("o")
    logDir = $logDir
    runTimestamp = $runTimestamp
} | ConvertTo-Json

Set-Content -Path $sessionFile -Value $sessionInfo

Write-Host ""
Write-Host "Local stack is starting."
Write-Host "App URL: http://focusflow.local/"
Write-Host "API base: http://focusflow.local/api/"
Write-Host "DB Seeder: http://localhost:3010/"
Write-Host ""
Write-Host "Logs:"
Write-Host "  $logDir"
