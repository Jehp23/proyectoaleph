// scripts/sync-artifacts.js
import fs from "fs";
import path from "path";
import { SYNC_PATHS } from "./config.js";

function copyFile(src, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  const dst = path.join(dstDir, path.basename(src));
  fs.copyFileSync(src, dst);
}

function copyDir(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
  }
}

const deployments = path.join(process.cwd(), "deployments", "localhost.json");
const abiDir      = path.join(process.cwd(), "abi");

for (const target of [SYNC_PATHS.frontend, SYNC_PATHS.backend]) {
  if (!target) continue;
  copyFile(deployments, target);
  copyDir(abiDir, path.join(target, "abi"));
  console.log("Synced to", target);
}
