const { ethers } = require("hardhat");

async function main() {
  // Load deployment addresses
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment file not found. Run deploy script first.");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const { wbtc: wbtcAddress, oracle: oracleAddress, vaultManager: vaultManagerAddress } = deployment.contracts;
  
  const oracle = await ethers.getContractAt("MockOracle", oracleAddress);
  const vaultManager = await ethers.getContractAt("VaultManager", vaultManagerAddress);
  
  // Get current price
  const currentPrice = await oracle.getPrice(wbtcAddress);
  console.log(`Current BTC Price: $${ethers.formatUnits(currentPrice, 8)}`);
  
  // Get drop percentage from command line args or default to 20%
  const dropPercentage = process.argv[2] ? parseInt(process.argv[2]) : 20;
  console.log(`Simulating ${dropPercentage}% price drop...`);
  
  // Simulate price drop
  await oracle.simulatePriceDrop(wbtcAddress, dropPercentage);
  
  const newPrice = await oracle.getPrice(wbtcAddress);
  console.log(`New BTC Price: $${ethers.formatUnits(newPrice, 8)}`);
  
  // Check vault statuses
  console.log("\n=== Vault Status After Price Drop ===");
  
  const [, user1, user2] = await ethers.getSigners();
  const users = [user1, user2];
  const userLabels = ["User1", "User2"];
  
  const unhealthyVaults = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const label = userLabels[i];
    const vaultData = await vaultManager.getVaultData(user.address);
    
    if (!vaultData.isActive) continue;
    
    const healthFactor = Number(vaultData.healthFactor) / 100;
    const isUnhealthy = healthFactor < 1.0;
    
    console.log(`\n${label} Vault:`);
    console.log(`  Collateral: ${ethers.formatUnits(vaultData.collateralAmount, 8)} WBTC`);
    console.log(`  Debt: ${ethers.formatUnits(vaultData.debtAmount, 18)} mUSD`);
    console.log(`  LTV: ${vaultData.ltv}%`);
    console.log(`  Health Factor: ${healthFactor.toFixed(2)} ${isUnhealthy ? '🚨 LIQUIDATABLE' : '✅ HEALTHY'}`);
    
    if (isUnhealthy) {
      unhealthyVaults.push({
        user: user.address,
        label,
        vaultData
      });
    }
  }
  
  if (unhealthyVaults.length > 0) {
    console.log(`\n🚨 ${unhealthyVaults.length} vault(s) can be liquidated!`);
    console.log("\nTo liquidate, run:");
    console.log(`npx hardhat run scripts/liquidate.js --network ${network.name}`);
  } else {
    console.log("\n✅ All vaults remain healthy after price drop");
  }
  
  // Update protocol data
  const protocolData = await vaultManager.getProtocolData();
  console.log("\n=== Updated Protocol Status ===");
  console.log(`BTC Price: $${ethers.formatUnits(protocolData.wbtcPrice, 8)}`);
  console.log(`Total Collateral: ${ethers.formatUnits(protocolData._totalCollateral, 8)} WBTC`);
  console.log(`Total Debt: ${ethers.formatUnits(protocolData._totalDebt, 18)} mUSD`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
