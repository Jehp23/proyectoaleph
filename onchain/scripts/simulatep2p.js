// scripts/simulatep2p.js
import fs from "fs";
import path from "path";
import { DECIMALS, FLOW } from "./config.js";

/**
 * @param {import('hardhat').HardhatRuntimeEnvironment} hre
 */
export default async function (hre) {
  const { ethers, network } = hre;
  const u = (n) => ethers.parseUnits(n, DECIMALS);

  async function tryCall(obj, candidates, ...args) {
    for (const name of candidates) {
      if (!name || typeof obj[name] !== "function") continue;
      try {
        const tx = await obj[name](...args);
        const rcpt = await tx.wait();
        return { name, rcpt };
      } catch {}
    }
    throw new Error(`No funcionó ninguna: ${candidates.join(", ")}`);
  }

  const file = path.join(process.cwd(), "deployments", `${network.name}.json`);
  const addrs = JSON.parse(fs.readFileSync(file, "utf8"));
  const [deployer, lender, borrower] = await ethers.getSigners();

  const loanToken = await ethers.getContractAt("MockERC20", addrs.LoanToken, borrower);
  const p2p = await ethers.getContractAt("P2PSecuredLoan", addrs.P2PSecuredLoan, borrower);

  // 1) Depositar colateral
  await tryCall(p2p, ["depositCollateral", "deposit", "addCollateral"], u(FLOW.collateralToDeposit));
  console.log("✔ Colateral depositado");

  // 2) Tomar préstamo
  await tryCall(p2p, ["borrow", "takeLoan", "draw"], u(FLOW.principalToBorrow));
  console.log("✔ Préstamo tomado");

  // 3) Avanzar tiempo (si aplica)
  try {
    await network.provider.send("evm_increaseTime", [FLOW.repayAfterDays * 24 * 60 * 60]);
    await network.provider.send("evm_mine");
  } catch {
    // Ignorar si no es red Hardhat
  }

  // 4) Repago
  try {
    await tryCall(p2p, ["repayMax", "repayAll", "repayFull"]);
    console.log("✔ Repago total (repayMax/All/Full)");
  } catch {
    const principal = u(FLOW.principalToBorrow);
    const interest = (principal * BigInt(FLOW.offchainInterestPct)) / 100n;
    const total = principal + interest;

    await (await loanToken.approve(addrs.P2PSecuredLoan, total)).wait();
    await tryCall(p2p, ["repay", "repayDebt", "repayLoan"], total);
    console.log("✔ Repago total (manual)");
  }

  // // Alternativa: probar liquidación
  // await tryCall(p2p.connect(lender), ["liquidate", "seize", "liquidateBorrower"], borrower.address);
  // console.log("✔ Liquidación ejecutada");

  console.log("OK: flujo P2P (deposit -> borrow -> repay).");
}

