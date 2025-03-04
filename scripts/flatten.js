const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function main() {
  const contracts = [
    'BettingPool',
    'CommentHub',
    'SpecificBet'
  ];

  for (const contract of contracts) {
    console.log(`Flattening ${contract}...`);
    
    try {
      await execAsync(`npx hardhat flatten contracts/${contract}.sol > flattened/${contract}.sol`);
      console.log(`${contract} flattened successfully!`);
      
      // Read the flattened file
      let content = fs.readFileSync(`flattened/${contract}.sol`, 'utf8');
      
      // Remove duplicate SPDX license identifiers and pragma statements
      const lines = content.split('\n');
      const unique = new Set();
      const filtered = lines.filter(line => {
        if (line.includes('SPDX-License-Identifier') || line.includes('pragma solidity')) {
          if (unique.has(line)) return false;
          unique.add(line);
        }
        return true;
      });
      
      // Write back the cleaned content
      fs.writeFileSync(`flattened/${contract}.sol`, filtered.join('\n'));
      
    } catch (error) {
      console.error(`Error flattening ${contract}:`, error);
    }
  }
}

// Create flattened directory if it doesn't exist
if (!fs.existsSync('flattened')) {
  fs.mkdirSync('flattened');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
