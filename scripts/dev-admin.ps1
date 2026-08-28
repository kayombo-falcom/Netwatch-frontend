# Self-elevating launcher for `npm run dev:admin`. OS detection (nmap -O)
# needs administrator privileges for raw-packet probes; this exists so that's
# a one-command run instead of remembering to open an elevated terminal.
$isElevated = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isElevated) {
    try {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$PSCommandPath`"" -ErrorAction Stop
    } catch {
        Write-Host "Couldn't open an elevated window: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "This usually means UAC can't prompt from this session (e.g. no interactive desktop)." -ForegroundColor Yellow
        Write-Host "Workaround: right-click your terminal and choose 'Run as administrator', then run 'npm run dev' from there." -ForegroundColor Yellow
        exit 1
    }
    exit
}

# Belt-and-suspenders: an elevated relaunch can still inherit a stale PATH
# from whatever process started this one, so make sure nmap resolves here
# regardless of what the system PATH currently has cached.
$nmapDir = "C:\Program Files (x86)\Nmap"
if ((Test-Path $nmapDir) -and ($env:Path -notlike "*$nmapDir*")) {
    $env:Path += ";$nmapDir"
}

Set-Location (Join-Path $PSScriptRoot "..")
npm run dev
