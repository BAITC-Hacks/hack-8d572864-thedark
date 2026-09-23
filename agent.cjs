// Local launcher: npm run agent:setup (once), then npm run agent.
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const root = __dirname;
const bundled = path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', process.platform === 'win32' ? 'python.exe' : 'bin/python3');
const candidates = [
  [path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'), []],
  ['python', []], ['python3', []], ['py', ['-3']], [bundled, []]
];
const python = candidates.find(([command, args]) => {
  const check = spawnSync(command, [...args, '-c', 'import sys;sys.exit(0 if sys.version_info >= (3,10) else 1)'], { windowsHide: true, stdio: 'ignore', timeout: 5000 });
  return check.status === 0;
});
if (!python) { console.error('Python 3.10+ is required. Install Python, then retry.'); process.exit(1); }
const setup = process.argv.includes('--setup');
const args = setup
  ? ['-m', 'pip', 'install', '--target', path.join(root, '.backend-deps'), '-r', path.join(root, 'backend/requirements.txt')]
  : [path.join(root, 'backend/run.py')];
if (!setup && !fs.existsSync(path.join(root, '.backend-deps/fastapi'))) {
  console.error('First install backend dependencies: npm run agent:setup'); process.exit(1);
}
const child = spawn(python[0], [...python[1], ...args], { cwd: root, stdio: 'inherit', windowsHide: true });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
