// hardhat.config.ts / hardhat.config.js (ESM)
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-ignition-ethers";

export default {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hardhat:   { type: "edr-simulated", chainId: 31337 },
    localhost: { type: "http", url: "http://127.0.0.1:8545" },
    // sepolia: { type: "http", url: "${SEPOLIA_RPC_URL}", accounts: ["${PRIVATE_KEY}"], chainId: 11155111 },
  },
};
