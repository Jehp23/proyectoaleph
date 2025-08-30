from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
import os, json
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
LOAN_ADDRESS = os.getenv("LOAN_ADDRESS")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Try reading ABI from frontend build path
ABI_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "onchain", "abi", "P2PSecuredLoan.json")
if not os.path.exists(ABI_PATH):
    ABI_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "onchain", "abi", "SecuredCrowdLoan.json")

if os.path.exists(ABI_PATH) and LOAN_ADDRESS:
    with open(ABI_PATH) as f:
        ABI = json.load(f)
    loan = w3.eth.contract(address=Web3.to_checksum_address(LOAN_ADDRESS), abi=ABI)
else:
    loan = None

app = FastAPI(title="Aleph Loan API")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True
)

@app.get("/health")
def health(): return {"ok": True}

@app.get("/status")
def status():
    if not loan:
        return {"error":"ABI or LOAN_ADDRESS missing"}
    st = loan.functions.currentState().call()
    tf = loan.functions.totalFunded().call() if hasattr(loan.functions, "totalFunded") else None
    return {"state": int(st), "totalFunded": (str(tf) if tf is not None else None)}
