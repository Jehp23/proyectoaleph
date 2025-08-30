#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing CauciónBTC dependencies...\n');

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Make sure you are in the project root.');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing npm dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Dependencies installed successfully!');
  
  // Check if .env exists
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('\n📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please configure your environment variables.');
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Configure your .env file with RPC URLs and private keys');
  console.log('2. Deploy contracts: npm run deploy:sepolia');
  console.log('3. Seed demo data: npm run seed:sepolia');
  console.log('4. Start development: npm run dev');
  console.log('\n🔗 Useful commands:');
  console.log('- npm run compile: Compile smart contracts');
  console.log('- npm run test: Run contract tests');
  console.log('- npm run simulate-drop: Simulate BTC price drop');
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
