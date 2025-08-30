import fs from 'fs';
import path from 'path';

const artifactsRoot = new URL('../artifacts/contracts', import.meta.url).pathname;
const outRoot = new URL('../../frontend/onchain', import.meta.url).pathname;
const abiOut = path.join(outRoot, 'abi');
fs.mkdirSync(abiOut, { recursive: true });

function copyAbi(contractFile) {
  const base = path.basename(contractFile, '.sol');
  const artifactPath = path.join(artifactsRoot, `${contractFile}/${base}.json`);
  if (!fs.existsSync(artifactPath)) {
    console.warn('No artifact for', contractFile, '(compile first)');
    return;
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  fs.writeFileSync(path.join(abiOut, `${base}.json`), JSON.stringify(abi, null, 2));
  console.log('ABI exported:', base);
}

// Adjust contracts list as needed
['P2PSecuredLoan.sol','FaucetERC20.sol','SecuredCrowdLoan.sol','VaultManager.sol','MockERC20.sol','MockOracle.sol']
  .forEach(copyAbi);

// Addresses example scaffold
const addrPath = path.join(outRoot, 'addresses.json');
if (!fs.existsSync(addrPath)) {
  fs.writeFileSync(addrPath, JSON.stringify({ sepolia: {
    P2PSecuredLoan: "0x...",
    SecuredCrowdLoan: "0x...",
    USDT: "0x...",
    WETH: "0x..."
  }}, null, 2));
  console.log('Created frontend/onchain/addresses.json (fill with real addresses)');
}
