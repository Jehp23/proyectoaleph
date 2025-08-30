from __future__ import annotations
from pathlib import Path
import json
from web3 import Web3

CONFIG_PATH = Path(__file__).parent / "config.json"
DEFAULTS_PATH = Path(__file__).parent / ".." / "frontend" / "onchain" / "/abi" / "addresses.json"

KEYS = ["loan", "usdtToken", "wethToken", "priceOracle", "network"]

def _checksum(addr: str | None) -> str | None:
    if not addr:
        return None
    if not Web3.is_address(addr):
        raise ValueError(f"Dirección inválida: {addr}")
    return Web3.to_checksum_address(addr)

def _clean(cfg: dict) -> dict:
    out = {}
    for k in KEYS:
        v = cfg.get(k)
        out[k] = _checksum(v) if v else None
    # opcional: red (sepolia/localhost)
    out["network"] = cfg.get("network", "sepolia")
    return out

def load_config() -> dict:
    # 1) si ya hay config guardada, úsala
    if CONFIG_PATH.exists():
        return json.loads(CONFIG_PATH.read_text())
    # 2) si no, intenta sembrar con frontend/onchain/addresses.json
    base = {"network": "sepolia"}
    try:
        defaults = json.loads(DEFAULTS_PATH.read_text())
        sepolia = defaults.get("sepolia", {})
        base.update({
            "vaultManager": sepolia.get("VaultManager"),
            "btcToken": sepolia.get("WBTC"),
            "usdtToken": sepolia.get("USDT"),
            "priceOracle": sepolia.get("Oracle"),
            "loan": sepolia.get("P2PSecuredLoan"),  # por si usas el P2P
        })
    except Exception:
        pass
    cfg = _clean(base)
    CONFIG_PATH.write_text(json.dumps(cfg, indent=2))
    return cfg

def save_config(new_cfg: dict) -> dict:
    current = load_config()
    current.update({k: v for k, v in new_cfg.items() if v is not None})
    cleaned = _clean(current)
    CONFIG_PATH.write_text(json.dumps(cleaned, indent=2))
    return cleaned
