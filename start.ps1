$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$qurylymNodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($qurylymNodeCommand) {
    & $qurylymNodeCommand.Source (Join-Path $PSScriptRoot 'server.cjs')
} else {
    $qurylymBundledNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
    if (Test-Path -LiteralPath $qurylymBundledNode) {
        & $qurylymBundledNode (Join-Path $PSScriptRoot 'server.cjs')
    } else {
        Write-Error 'Node.js is required. Install Node.js, then run npm start in this folder.'
    }
}
