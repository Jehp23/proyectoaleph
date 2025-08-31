// scripts/deploy.js
import fs from "fs";
import path from "path";

/**
 * Deploy contracts in the correct order and persist addresses.
 * Ensures each deployment waits to be mined before continuing.
 * @param {import('hardhat').HardhatRuntimeEnvironment} hre
 */
export default async function main(hre) {
  console.log("[deploy] Iniciando despliegue...");
  const { ethers, network } = hre;

  // 1) Deploy MockERC20 (token del préstamo)
  const LoanTokenF = await ethers.getContractFactory("MockERC20");
  const decimals = 18;
  const initialSupply = ethers.parseUnits("1000000", decimals);
  const loanToken = await LoanTokenF.deploy("Mock USD", "mUSD", decimals, initialSupply);
  await loanToken.waitForDeployment();
  const loanTokenAddr = await loanToken.getAddress();

  // 2) Deploy MockOracle
  const OracleF = await ethers.getContractFactory("MockOracle");
  const oracle = await OracleF.deploy();
  await oracle.waitForDeployment();
  const oracleAddr = await oracle.getAddress();

  // 3) Deploy P2PSecuredLoan (usa el token anterior)
  const P2PF = await ethers.getContractFactory("P2PSecuredLoan");
  const [, borrower] = await ethers.getSigners();
  const borrowerAddr = borrower.address;
  const loanAmount = ethers.parseUnits("1000", decimals);
  const interestAmount = ethers.parseUnits("50", decimals);
  const collateralAmount = ethers.parseUnits("2000", decimals);
  const now = Math.floor(Date.now() / 1000);
  const fundingDeadline = now + 3600; // +1h
  const dueDate = now + 86400;        // +1d
  const p2p = await P2PF.deploy(
    loanTokenAddr,
    loanTokenAddr,
    borrowerAddr,
    loanAmount,
    interestAmount,
    collateralAmount,
    fundingDeadline,
    dueDate
  );
  await p2p.waitForDeployment();
  const p2pAddr = await p2p.getAddress();

  console.log("LoanToken (mUSD):", loanTokenAddr);
  console.log("MockOracle      :", oracleAddr);
  console.log("P2PSecuredLoan  :", p2pAddr);

  // 4) Guardar addresses
  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        LoanToken: loanTokenAddr,
        MockOracle: oracleAddr,
        P2PSecuredLoan: p2pAddr,
      },
      null,
      2
    )
  );
  console.log(`[deploy] Addresses guardados en ${file}`);
}

