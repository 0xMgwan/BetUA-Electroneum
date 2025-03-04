const hre = require("hardhat");
require('dotenv').config();

async function main() {
  try {
    // Connect to the contract
    const BettingPool = await hre.ethers.getContractFactory("BettingPool");
    const bettingPool = BettingPool.attach(process.env.BETTING_POOL_ADDRESS);
    
    // Get all events from the last 100 blocks
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Current block:", currentBlock);
    
    console.log("\nFetching GameCreated events...");
    const createEvents = await bettingPool.queryFilter(
      bettingPool.filters.GameCreated(),
      currentBlock - 100,
      currentBlock
    );
    
    for (const event of createEvents) {
      console.log("\nGame Created:");
      console.log("- Transaction:", event.transactionHash);
      console.log("- Block:", event.blockNumber);
      console.log("- Game ID:", event.args.gameId.toString());
      
      // Get game details
      const game = await bettingPool.getGame(event.args.gameId);
      console.log("- Home Team:", game.homeTeam);
      console.log("- Away Team:", game.awayTeam);
      console.log("- Start Time:", new Date(game.startTime * 1000).toISOString());
      console.log("- Status:", game.status);
      console.log("- Result:", game.result);
      console.log("- Total Bets:", hre.ethers.utils.formatEther(game.totalBets), "ETN");
    }
    
    console.log("\nFetching BetPlaced events...");
    const betEvents = await bettingPool.queryFilter(
      bettingPool.filters.BetPlaced(),
      currentBlock - 100,
      currentBlock
    );
    
    for (const event of betEvents) {
      console.log("\nBet Placed:");
      console.log("- Transaction:", event.transactionHash);
      console.log("- Block:", event.blockNumber);
      console.log("- Game ID:", event.args.gameId.toString());
      console.log("- Bettor:", event.args.bettor);
      console.log("- Outcome:", event.args.outcome);
      console.log("- Amount:", hre.ethers.utils.formatEther(event.args.amount), "ETN");
    }
    
    console.log("\nFetching GameResultSet events...");
    const resultEvents = await bettingPool.queryFilter(
      bettingPool.filters.GameResultSet(),
      currentBlock - 100,
      currentBlock
    );
    
    for (const event of resultEvents) {
      console.log("\nGame Result Set:");
      console.log("- Transaction:", event.transactionHash);
      console.log("- Block:", event.blockNumber);
      console.log("- Game ID:", event.args.gameId.toString());
      console.log("- Result:", event.args.result);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
