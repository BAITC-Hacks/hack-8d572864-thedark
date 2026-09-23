"""python backend/run.py — or npm run agent using the cross-platform launcher."""
from pathlib import Path
import sys
import os

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))
local_dependencies = root / '.backend-deps'
if local_dependencies.is_dir():
    sys.path.insert(0, str(local_dependencies))

if __name__ == '__main__':
    import uvicorn
    from backend.network import lan_addresses
    port = int(os.getenv('PORT', '8000'))
    print(f'KT Neural live agent: http://127.0.0.1:{port}', flush=True)
    for address in lan_addresses():
        print(f'LAN / other laptop: http://{address}:{port}', flush=True)
    print('Keep this terminal open. Ctrl+C stops the server.', flush=True)
    uvicorn.run('backend.app:app', host='0.0.0.0', port=port, log_level='warning')
