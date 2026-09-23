"""No shell quoting needed: exit 0 when backend modules can be imported."""
import importlib
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.backend-deps'))
try:
    for module in ['fastapi', 'uvicorn', 'multipart', 'openai', 'dotenv', 'docx', 'pypdf', 'openpyxl']:
        importlib.import_module(module)
except ImportError:
    sys.exit(1)
