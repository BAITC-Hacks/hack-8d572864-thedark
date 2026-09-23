$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

# The launcher works even when npm and Python are not in VS Code's PATH.
$agentPython = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
if (-not (Test-Path -LiteralPath $agentPython)) {
    $agentPythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if (-not $agentPythonCommand) { throw 'Python 3.10+ is required. Install Python, then run this file again.' }
    $agentPython = $agentPythonCommand.Source
}
& $agentPython -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)'
if ($LASTEXITCODE -ne 0) { throw 'Python 3.10+ is required.' }

& $agentPython -c 'import sys,importlib.util; sys.path.insert(0,".backend-deps"); sys.exit(0 if all(importlib.util.find_spec(m) for m in ["fastapi","uvicorn","multipart","openai","dotenv","docx","pypdf","openpyxl"]) else 1)'
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing backend libraries (first launch only)...'
    & $agentPython -m pip install --target .backend-deps -r backend/requirements.txt --disable-pip-version-check
    if ($LASTEXITCODE -ne 0) { throw 'Installation failed. Check the network connection and run this launcher again.' }
}

if (-not (Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
    Write-Host 'Add your OpenAI API key to .env before analyzing documents.'
}
Write-Host 'Open http://127.0.0.1:8000 in your browser. Keep this window open.'
& $agentPython backend/run.py
if ($LASTEXITCODE -ne 0) { throw 'The server stopped. Read the error above. Port 8000 may already be in use.' }
