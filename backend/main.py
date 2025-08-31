# backend/main.py
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from web3 import Web3
from dotenv import load_dotenv
import os

from config import read_config, write_config

load_dotenv()

app = FastAPI(title="P2P Backend (Python)")

# ── CORS ──
FRONT = os.getenv("FRONT_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONT, "*"],   # si querés más estricto, sacá "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Modelos ──
class P2PConfiguration(BaseModel):
    network: str         # "localhost" | "sepolia"
    loan: str
    usdtToken: str
    wethToken: str
    priceOracle: str | None = ""

    @field_validator("network")
    @classmethod
    def v_network(cls, v):
        if v not in ("localhost", "sepolia"):
            raise ValueError("network inválida")
        return v

    @staticmethod
    def _is_hex_addr(v: str) -> bool:
        try:
            return Web3.is_address(v)
        except Exception:
            return False

    @field_validator("loan", "usdtToken", "wethToken", "priceOracle")
    @classmethod
    def v_addr(cls, v):
        if v in (None, ""):
            return v or ""
        if not cls._is_hex_addr(v):
            raise ValueError("dirección inválida")
        return Web3.to_checksum_address(v)

# ── Auth opcional ──
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "").strip()

def require_admin(req: Request):
    if not ADMIN_TOKEN:
        return
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer ") or auth.split(" ", 1)[1] != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

# ── Rutas ──
@app.get("/config")
def get_config():
    return read_config()

@app.post("/config")
def set_config(cfg: P2PConfiguration, _: None = Depends(require_admin)):
    saved = write_config(cfg.model_dump())
    return saved

# ABI mínimo de Chainlink AggregatorV3
AGG_ABI = [
    {
        "inputs": [],
        "name": "latestRoundData",
        "outputs": [
            {"internalType":"uint80","name":"roundId","type":"uint80"},
            {"internalType":"int256","name":"answer","type":"int256"},
            {"internalType":"uint256","name":"startedAt","type":"uint256"},
            {"internalType":"uint256","name":"updatedAt","type":"uint256"},
            {"internalType":"uint80","name":"answeredInRound","type":"uint80"}
        ],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs": [],
        "name": "description",
        "outputs": [{"internalType":"string","name":"","type":"string"}],
        "stateMutability":"view",
        "type":"function"
    }
]

@app.get("/oracle/price")
def oracle_price():
    cfg = read_config()

    # Elegir RPC según red
    if cfg.get("network") == "sepolia":
        rpc = os.getenv("SEPOLIA_RPC", "").strip()
        if not rpc:
            raise HTTPException(500, "Falta SEPOLIA_RPC en .env")
    else:
        rpc = os.getenv("LOCAL_RPC", "http://127.0.0.1:8545")

    w3 = Web3(Web3.HTTPProvider(rpc))
    if not w3.is_connected():
        raise HTTPException(500, f"No conecta al RPC: {rpc}")

    oracle = (cfg.get("priceOracle") or "").strip()
    if not oracle:
        # En localhost probablemente no tengas oracle: devolvemos dummy
        return {"description": "Mock Oracle (localhost)", "price": "0"}

    if not Web3.is_address(oracle):
        raise HTTPException(400, "Oracle address inválida")

    oracle = Web3.to_checksum_address(oracle)
    contract = w3.eth.contract(address=oracle, abi=AGG_ABI)
    try:
        roundData = contract.functions.latestRoundData().call()
        desc = contract.functions.description().call()
        price = str(roundData[1])  # int256
        return {"description": desc, "price": price}
    except Exception as e:
        raise HTTPException(500, f"Chainlink read error: {e}")


# Run: uvicorn main:app --reload --port 4000
