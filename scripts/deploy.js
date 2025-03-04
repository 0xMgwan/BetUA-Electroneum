const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETN");

    // Deploy BettingPool
    console.log("Deploying BettingPool...");
    const BettingPool = await hre.ethers.getContractFactory("BettingPool");
    const bettingPool = await BettingPool.deploy();
    await bettingPool.deployed();
    console.log("BettingPool deployed to:", bettingPool.address);

    // Deploy CommentHub
    console.log("Deploying CommentHub...");
    const CommentHub = await hre.ethers.getContractFactory("CommentHub");
    const commentHub = await CommentHub.deploy();
    await commentHub.deployed();
    console.log("CommentHub deployed to:", commentHub.address);

    // Deploy SpecificBet
    console.log("Deploying SpecificBet...");
    const SpecificBet = await hre.ethers.getContractFactory("SpecificBet");
    const specificBet = await SpecificBet.deploy();
    await specificBet.deployed();
    console.log("SpecificBet deployed to:", specificBet.address);

    // Update .env file with contract addresses
    const envContent = `# Blockchain Configuration
ELECTRONEUM_RPC_URL=${process.env.ELECTRONEUM_RPC_URL}
ELECTRONEUM_WS_URL=${process.env.ELECTRONEUM_WS_URL}
PRIVATE_KEY=${process.env.PRIVATE_KEY}

# Contract Addresses (deployed on Electroneum testnet)
BETTING_POOL_ADDRESS=${bettingPool.address}
COMMENT_HUB_ADDRESS=${commentHub.address}
SPECIFIC_BET_ADDRESS=${specificBet.address}

# Server Configuration
PORT=3000
NODE_ENV=development

# Storage Configuration
WEB3_STORAGE_TOKEN=your_web3_storage_token`;

    require('fs').writeFileSync('.env', envContent);
    console.log("\nContract addresses have been updated in .env file");
    
    console.log("\nDeployment complete! View your contracts on Electroneum Explorer:");
    console.log(`BettingPool: https://blockexplorer.electroneum.com/address/${bettingPool.address}`);
    console.log(`CommentHub: https://blockexplorer.electroneum.com/address/${commentHub.address}`);
    console.log(`SpecificBet: https://blockexplorer.electroneum.com/address/${specificBet.address}`);

  } catch (error) {
    console.error("Error during deployment:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
