import { ethers } from 'ethers';
import { OracleService } from './oracle/oracle-service';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Load environment variables
  const {
    PRIVATE_KEY,
    FOOTBALL_DATA_KEY,
    SPORTS_DATA_KEY,
    BETTING_POOL_ADDRESS,
    ELECTRONEUM_TESTNET_RPC_URL
  } = process.env;

  if (!PRIVATE_KEY || !FOOTBALL_DATA_KEY || !SPORTS_DATA_KEY || !BETTING_POOL_ADDRESS || !ELECTRONEUM_TESTNET_RPC_URL) {
    throw new Error('Missing required environment variables');
  }

  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider(ELECTRONEUM_TESTNET_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Oracle wallet address:', wallet.address);

  // Get the contract ABI
  const BettingPool = require('../artifacts/contracts/BettingPool.sol/BettingPool.json');
  const contract = new ethers.Contract(BETTING_POOL_ADDRESS, BettingPool.abi, wallet);

  // Create and start the oracle service
  const oracle = new OracleService(
    contract,
    wallet,
    FOOTBALL_DATA_KEY,
    SPORTS_DATA_KEY
  );

  // Start monitoring matches
  await oracle.start();
  console.log('Oracle service started');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
