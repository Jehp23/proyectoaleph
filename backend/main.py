from fastapi import FastAPI, Header, HTTPException
from config import load_config, save_config
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
import os, json
from dotenv import load_dotenv
from pathlib import Path

PLACEHOLDERS = {"0x...", "0x", "", None, "-"}

def _checksum(addr: str | None) -> str | None:
    """Devuelve la dirección en checksum o None si es placeholder/vacía."""
    if addr is None:
        return None
    s = str(addr).strip()
    if s in PLACEHOLDERS:
        return None
    # Aceptar sólo 0x válidas
    if Web3.is_address(s):
        return Web3.to_checksum_address(s)
    # si no es válida, ignorala (o levantá si preferís estricto)
    return None
    # Si querés que falle en inválidas, cambialo por:
    # raise ValueError(f"Dirección inválida: {addr}")

load_dotenv()

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")  # opcional para proteger PUT /config

app = FastAPI(title="Aleph Config API")

# CORS: agrega el origen del front si querés restringir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# carga inicial
CFG = load_config()
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Helpers para contratos (cámbialos según lo que leas)
def get_vault_manager():
    addr = CFG.get("vaultManager")
    if not addr:
        return None
    abi_path = Path(__file__).parent / ".." / "frontend" / "onchain" / "abi" / "VaultManager.json"
    abi = json.loads(abi_path.read_text())
    return w3.eth.contract(address=Web3.to_checksum_address(addr), abi=abi)

def get_p2p_loan():
    addr = CFG.get("loan")
    if not addr:
        return None
    abi_path = Path(__file__).parent / ".." / "frontend" / "onchain" / "abi" / "P2PSecuredLoan.json"
    if not abi_path.exists():
        abi_path = Path(__file__).parent / ".." / "frontend" / "onchain" / "abi" / "SecuredCrowdLoan.json"
    abi = json.loads(abi_path.read_text())
    return w3.eth.contract(address=Web3.to_checksum_address(addr), abi=abi)

@app.get("/config")
def read_config():
    return CFG

@app.put("/config")
def update_config(cfg: dict, x_admin_token: str | None = Header(default=None)):
    # protección opcional
    if ADMIN_TOKEN and x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")
    global CFG
    CFG = save_config(cfg)
    return CFG

@app.get("/health")
def health():
    return {"ok": True, "block": w3.eth.block_number}

@app.get("/status")
def status():
    # ejemplo: prioridad al P2P, sino VaultManager
    loan = get_p2p_loan()
    if loan:
        st = int(loan.functions.currentState().call())
        resp = {"kind": "p2p", "state": st}
        for fn in ["loanAmount", "interestAmount", "collateralAmount", "totalFunded", "fundingDeadline", "dueDate"]:
            if fn in [f.fn_name for f in loan.all_functions()]:
                try:
                    resp[fn] = int(getattr(loan.functions, fn)().call())
                except Exception:
                    pass
        return resp
    vm = get_vault_manager()
    if vm:
        # agrega aquí lecturas que te interesen del VaultManager
        return {"kind": "vault", "address": CFG.get("vaultManager")}
    return {"error": "no contracts configured"}
# --- ORACLE (Chainlink) ---
AGG_ABI = [
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"latestRoundData","outputs":[
        {"internalType":"uint80","name":"roundId","type":"uint80"},
        {"internalType":"int256","name":"answer","type":"int256"},
        {"internalType":"uint256","name":"startedAt","type":"uint256"},
        {"internalType":"uint256","name":"updatedAt","type":"uint256"},
        {"internalType":"uint80","name":"answeredInRound","type":"uint80"}
    ],"stateMutability":"view","type":"function"}
]

def get_oracle():
    addr = CFG.get("priceOracle")
    if not addr:
        return None
    return w3.eth.contract(address=Web3.to_checksum_address(addr), abi=AGG_ABI)

@app.get("/price")
def price():
    """Devuelve precio del oracle configurado (Chainlink AggregatorV3Interface)."""
    oracle = get_oracle()
    if not oracle:
        return {"error": "priceOracle not configured"}
    dec = oracle.functions.decimals().call()
    r = oracle.functions.latestRoundData().call()
    # r[1] es int256 'answer' (precio * 10**dec)
    return {
        "description": oracle.functions.description().call(),
        "decimals": int(dec),
        "roundId": int(r[0]),
        "answer": str(r[1]),
        "updatedAt": int(r[3]),
        "price": float(r[1]) / (10 ** dec)  # valor humano
    }
