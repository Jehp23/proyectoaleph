# backend/config.py
from pathlib import Path
import json

FILE = Path(__file__).resolve().parent / "config.json"

DEFAULTS = {
    "network": "localhost",   # "localhost" | "sepolia"
    "loan": "",
    "usdtToken": "",
    "wethToken": "",
    "priceOracle": ""
}

def read_config() -> dict:
    if not FILE.exists():
        return DEFAULTS.copy()
    try:
        data = json.loads(FILE.read_text(encoding="utf-8"))
        merged = DEFAULTS.copy()
        merged.update(data or {})
        return merged
    except Exception:
        return DEFAULTS.copy()

def write_config(cfg: dict) -> dict:
    FILE.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
    return cfg
