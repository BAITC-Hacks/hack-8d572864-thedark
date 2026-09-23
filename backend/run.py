"""python backend/run.py — or npm run agent using the cross-platform launcher."""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))
local_dependencies = root / '.backend-deps'
if local_dependencies.is_dir():
    sys.path.insert(0, str(local_dependencies))

if __name__ == '__main__':
    import uvicorn
    print('KT Neural live agent: http://127.0.0.1:8000', flush=True)
    print('Keep this terminal open. Ctrl+C stops the server.', flush=True)
    uvicorn.run('backend.app:app', host='127.0.0.1', port=8000, log_level='warning')
