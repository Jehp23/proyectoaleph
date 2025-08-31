// scripts/export-abi.js
import fs from "fs";
import path from "path";

const artifacts = path.join(process.cwd(), "artifacts", "contracts");
const targets = [
  ["MockERC20.sol",       "MockERC20"],
  ["MockOracle.sol",      "MockOracle"],
  ["P2PSecuredLoan.sol",  "P2PSecuredLoan"],
];

const outDir = path.join(process.cwd(), "abi");
fs.mkdirSync(outDir, { recursive: true });

for (const [sol, name] of targets) {
  const jsonPath = path.join(artifacts, sol, `${name}.json`);
  const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  fs.writeFileSync(path.join(outDir, `${name}.abi.json`), JSON.stringify(artifact.abi, null, 2));
  console.log("ABI exported:", name);
}
