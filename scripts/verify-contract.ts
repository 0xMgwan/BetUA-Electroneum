import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function verifyContract(
  contractAddress: string,
  sourceCode: string,
  contractName: string
) {
  try {
    const verificationData = {
      addressHash: contractAddress,
      name: contractName,
      compilerVersion: 'v0.8.19+commit.7dd6d404',
      optimization: true,
      optimizationRuns: 200,
      constructorArguments: '',
      sourceCode: sourceCode,
      autodetectConstructorArguments: true,
      evmVersion: 'paris',
      license: 'MIT'
    };

    const response = await axios.post(
      'https://blockexplorer.electroneum.com/api/v2/smart-contracts/verify',
      verificationData
    );

    console.log('Verification response:', response.data);
  } catch (error) {
    console.error('Error verifying contract:', error);
  }
}

async function main() {
  // Read the flattened source code
  const sourceCode = fs.readFileSync(
    path.join(__dirname, '..', 'BettingPool.flat.sol'),
    'utf8'
  );

  // Verify BettingPool
  await verifyContract(
    '0x72Ff093CEA6035fa395c0910B006af2DC4D4E9F5',
    sourceCode,
    'BettingPool'
  );

  // Verify CommentHub
  await verifyContract(
    '0xb9B885501fA529bdFf510969caD202a10800fF99',
    fs.readFileSync(path.join(__dirname, '..', 'CommentHub.flat.sol'), 'utf8'),
    'CommentHub'
  );

  // Verify SpecificBet
  await verifyContract(
    '0x4ecD2810a6A412fdc95B71c03767068C35D23fE3',
    fs.readFileSync(path.join(__dirname, '..', 'SpecificBet.flat.sol'), 'utf8'),
    'SpecificBet'
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
