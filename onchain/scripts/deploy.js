const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Mock Tokens
  console.log("\n=== Deploying Mock Tokens ===");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  // Deploy WBTC (8 decimals)
  const wbtc = await MockERC20.deploy(
    "Wrapped Bitcoin",
    "WBTC",
    8,
    ethers.parseUnits("1000", 8) // 1000 WBTC initial supply
  );
  await wbtc.waitForDeployment();
  console.log("WBTC deployed to:", await wbtc.getAddress());

  // Deploy mUSD (18 decimals)
  const musd = await MockERC20.deploy(
    "Mock USD",
    "mUSD",
    18,
    ethers.parseUnits("10000000", 18) // 10M mUSD initial supply
  );
  await musd.waitForDeployment();
  console.log("mUSD deployed to:", await musd.getAddress());

  // Deploy Mock Oracle
  console.log("\n=== Deploying Mock Oracle ===");
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const oracle = await MockOracle.deploy();
  await oracle.waitForDeployment();
  console.log("MockOracle deployed to:", await oracle.getAddress());

  // Set initial BTC price ($45,000)
  const initialBtcPrice = ethers.parseUnits("45000", 8);
  await oracle.setPrice(await wbtc.getAddress(), initialBtcPrice);
  console.log("Initial BTC price set to: $45,000");

  // Deploy VaultManager
  console.log("\n=== Deploying VaultManager ===");
  const VaultManager = await ethers.getContractFactory("VaultManager");
  const vaultManager = await VaultManager.deploy(
    await wbtc.getAddress(),
    await musd.getAddress(),
    await oracle.getAddress()
  );
  await vaultManager.waitForDeployment();
  console.log("VaultManager deployed to:", await vaultManager.getAddress());

  // Transfer mUSD to VaultManager for lending
  const lendingPool = ethers.parseUnits("1000000", 18); // 1M mUSD
  await musd.transfer(await vaultManager.getAddress(), lendingPool);
  console.log("Transferred 1M mUSD to VaultManager for lending");

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    contracts: {
      wbtc: await wbtc.getAddress(),
      musd: await musd.getAddress(),
      oracle: await oracle.getAddress(),
      vaultManager: await vaultManager.getAddress()
    },
    initialBtcPrice: initialBtcPrice.toString(),
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\nDeployment info saved to deployments/${network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
