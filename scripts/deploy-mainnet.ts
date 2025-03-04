import { ethers, run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function verifyContract(address: string, constructorArguments: any[] = []) {
  console.log(`\nVerifying contract at ${address}...`);
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments
    });
    console.log("Contract verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified");
    } else {
      console.error("Error verifying contract:", error);
    }
  }
}

async function main() {
  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETN");

    // Make sure we have enough ETN for oracle stake
    const MIN_ORACLE_STAKE = ethers.utils.parseEther("100"); // 100 ETN
    if (balance.lt(MIN_ORACLE_STAKE)) {
      throw new Error(`Insufficient balance. Need at least 100 ETN for oracle stake. Current balance: ${ethers.utils.formatEther(balance)} ETN`);
    }

    // Deploy BettingPool with oracle stake
    console.log("\nDeploying BettingPool...");
    const BettingPool = await ethers.getContractFactory("BettingPool");
    const bettingPool = await BettingPool.deploy({ value: MIN_ORACLE_STAKE });
    await bettingPool.deployed();
    console.log("BettingPool deployed to:", bettingPool.address);
    await verifyContract(bettingPool.address);

    // Deploy CommentHub
    console.log("\nDeploying CommentHub...");
    const CommentHub = await ethers.getContractFactory("CommentHub");
    const commentHub = await CommentHub.deploy();
    await commentHub.deployed();
    console.log("CommentHub deployed to:", commentHub.address);
    await verifyContract(commentHub.address);

    // Deploy SpecificBet
    console.log("\nDeploying SpecificBet...");
    const SpecificBet = await ethers.getContractFactory("SpecificBet");
    const specificBet = await SpecificBet.deploy();
    await specificBet.deployed();
    console.log("SpecificBet deployed to:", specificBet.address);
    await verifyContract(specificBet.address);

    console.log("\nUpdate your .env file with these values:");
    console.log(`BETTING_POOL_ADDRESS=${bettingPool.address}`);
    console.log(`COMMENT_HUB_ADDRESS=${commentHub.address}`);
    console.log(`SPECIFIC_BET_ADDRESS=${specificBet.address}`);

    console.log("\nNext steps:");
    console.log("1. Update contract addresses in .env");
    console.log("2. Make sure your API keys are set in .env");
    console.log("3. Run the oracle service: npm run oracle");

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
