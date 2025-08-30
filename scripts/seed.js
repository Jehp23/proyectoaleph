const { ethers } = require("hardhat");

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  
  // Load deployment addresses
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment file not found. Run deploy script first.");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const { wbtc: wbtcAddress, musd: musdAddress, oracle: oracleAddress, vaultManager: vaultManagerAddress } = deployment.contracts;
  
  console.log("Seeding contracts with demo data...");
  console.log("Network:", network.name);
  
  // Get contract instances
  const wbtc = await ethers.getContractAt("MockERC20", wbtcAddress);
  const musd = await ethers.getContractAt("MockERC20", musdAddress);
  const oracle = await ethers.getContractAt("MockOracle", oracleAddress);
  const vaultManager = await ethers.getContractAt("VaultManager", vaultManagerAddress);
  
  // Mint tokens to demo users
  console.log("\n=== Minting Demo Tokens ===");
  
  const users = [user1, user2];
  const userLabels = ["User1", "User2"];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const label = userLabels[i];
    
    // Mint WBTC (0.1 BTC each for testing)
    await wbtc.mint(user.address, ethers.parseUnits("0.1", 8));
    console.log(`${label} (${user.address}): +0.1 WBTC`);
    
    // Mint mUSD for repayments
    await musd.mint(user.address, ethers.parseUnits("10000", 18));
    console.log(`${label} (${user.address}): +10,000 mUSD`);
    
    // Approve VaultManager
    await wbtc.connect(user).approve(vaultManagerAddress, ethers.MaxUint256);
    await musd.connect(user).approve(vaultManagerAddress, ethers.MaxUint256);
    console.log(`${label}: Approved VaultManager for token spending`);
  }
  
  // Create demo vaults
  console.log("\n=== Creating Demo Vaults ===");
  
  // User1: Healthy vault (40% LTV)
  await vaultManager.connect(user1).depositCollateral(ethers.parseUnits("0.05", 8)); // 0.05 BTC
  await vaultManager.connect(user1).borrow(ethers.parseUnits("900", 18)); // $900 (40% LTV at $45k BTC)
  console.log("User1: Created healthy vault (0.05 BTC collateral, $900 borrowed)");
  
  // User2: Higher risk vault (55% LTV)
  await vaultManager.connect(user2).depositCollateral(ethers.parseUnits("0.04", 8)); // 0.04 BTC
  await vaultManager.connect(user2).borrow(ethers.parseUnits("990", 18)); // $990 (55% LTV at $45k BTC)
  console.log("User2: Created higher risk vault (0.04 BTC collateral, $990 borrowed)");
  
  // Display vault data
  console.log("\n=== Vault Status ===");
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const label = userLabels[i];
    const vaultData = await vaultManager.getVaultData(user.address);
    
    console.log(`\n${label} Vault:`);
    console.log(`  Collateral: ${ethers.formatUnits(vaultData.collateralAmount, 8)} WBTC`);
    console.log(`  Debt: ${ethers.formatUnits(vaultData.debtAmount, 18)} mUSD`);
    console.log(`  LTV: ${vaultData.ltv}%`);
    console.log(`  Health Factor: ${Number(vaultData.healthFactor) / 100}`);
    console.log(`  Liquidation Price: $${ethers.formatUnits(vaultData.liquidationPrice, 8)}`);
  }
  
  // Display protocol data
  const protocolData = await vaultManager.getProtocolData();
  console.log("\n=== Protocol Status ===");
  console.log(`Total Collateral: ${ethers.formatUnits(protocolData._totalCollateral, 8)} WBTC`);
  console.log(`Total Debt: ${ethers.formatUnits(protocolData._totalDebt, 18)} mUSD`);
  console.log(`Active Vaults: ${protocolData._vaultCount}`);
  console.log(`BTC Price: $${ethers.formatUnits(protocolData.wbtcPrice, 8)}`);
  
  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📋 Demo Script Ready:");
  console.log("1. Show healthy vaults");
  console.log("2. Simulate BTC price drop: npx hardhat run scripts/simulate-drop.js --network sepolia");
  console.log("3. Show liquidation opportunities");
  console.log("4. Execute liquidation");
  console.log("5. Show recovery");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
