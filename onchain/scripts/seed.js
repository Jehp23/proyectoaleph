// scripts/seed.js
import fs from "fs";
import path from "path";
import { DECIMALS, SEED } from "./config.js";

/**
 * @param {import('hardhat').HardhatRuntimeEnvironment} hre
 */
export default async function (hre) {
  const { ethers, network } = hre;
  const u = (n) => ethers.parseUnits(n, DECIMALS);

  const file = path.join(process.cwd(), "deployments", `${network.name}.json`);
  const addrs = JSON.parse(fs.readFileSync(file, "utf8"));
  const [deployer, lender, borrower] = await ethers.getSigners();

  const loanToken = await ethers.getContractAt("MockERC20", addrs.LoanToken, deployer);
  const p2p       = await ethers.getContractAt("P2PSecuredLoan", addrs.P2PSecuredLoan, deployer);

  // 1) Mint balances iniciales (esperar a minado)
  await (await loanToken.mint(lender.address,   u(SEED.lender.loanAsset))).wait();

  // 2) Fondear la liquidez (prueba nombres comunes de función)
  let ok = false;
  for (const fname of ["fund", "supply", "provideLiquidity", "depositLiquidity"]) {
    try {
      await (await loanToken.connect(lender).approve(addrs.P2PSecuredLoan, u(SEED.lender.loanAsset))).wait();
      const tx = await p2p.connect(lender)[fname](u(SEED.lender.loanAsset));
      await tx.wait();
      console.log(`Liquidity provided via ${fname}()`);
      ok = true;
      break;
    } catch {}
  }
  if (!ok) {
    // fallback: transferir tokens al contrato (si tu contrato los usa desde su balance)
    await (await loanToken.connect(lender).transfer(addrs.P2PSecuredLoan, u(SEED.lender.loanAsset))).wait();
    console.log("Liquidity provided via transfer() to contract");
  }

  console.log("Seed complete.");
}
