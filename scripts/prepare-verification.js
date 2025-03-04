const fs = require('fs');
const path = require('path');

const contracts = [
  {
    name: 'BettingPool',
    address: '0x18E0773B47b5Cb70c4179f4510f2b8Cd722BccA0',
    constructorArgs: ''
  },
  {
    name: 'CommentHub',
    address: '0xfBc307eabd9F50cc903f9569A3B92C9491eBaB3C',
    constructorArgs: ''
  },
  {
    name: 'SpecificBet',
    address: '0xeAc5dC76Ee0f8AFb7B0C2bc3a91aE6bf37A62623',
    constructorArgs: ''
  }
];

function prepareVerificationFiles() {
  // Create verification directory if it doesn't exist
  const verificationDir = path.join(__dirname, '..', 'verification');
  if (!fs.existsSync(verificationDir)) {
    fs.mkdirSync(verificationDir);
  }

  // Create verification instructions
  let instructions = `# Contract Verification Instructions

To verify the contracts on Electroneum Block Explorer:

1. Visit https://blockexplorer.electroneum.com
2. For each contract below, follow these steps:
   a. Click on the contract address
   b. Click on the "Code" tab
   c. Click "Verify & Publish"
   d. Fill in the following details:

## Contract Details

`;

  // Process each contract
  contracts.forEach(contract => {
    console.log(`Processing ${contract.name}...`);
    
    // Read the flattened source code
    const sourceCode = fs.readFileSync(
      path.join(__dirname, '..', 'flattened', `${contract.name}.sol`),
      'utf8'
    );

    // Create contract-specific instructions
    instructions += `### ${contract.name}
- Contract Address: ${contract.address}
- Contract Name: ${contract.name}
- Compiler Version: v0.8.19+commit.7dd6d404
- Optimization: Yes
- Optimization Runs: 200
- Source Code: See ${contract.name}.sol in this directory
- Constructor Arguments: ${contract.constructorArgs || 'None'}

`;

    // Write source code to verification directory
    fs.writeFileSync(
      path.join(verificationDir, `${contract.name}.sol`),
      sourceCode
    );
  });

  // Write instructions
  fs.writeFileSync(
    path.join(verificationDir, 'INSTRUCTIONS.md'),
    instructions
  );

  console.log('\nVerification files prepared in the verification directory.');
  console.log('Follow the instructions in INSTRUCTIONS.md to verify your contracts.');
}

prepareVerificationFiles();
