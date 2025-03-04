const { ethers } = require("hardhat");

async function main() {
  console.log("Testing deployed contracts on testnet...");

  try {
    // Get the contract factory
    const BettingPool = await ethers.getContractFactory("BettingPool");
    
    // Attach to the deployed contract
    const bettingPool = await BettingPool.attach("0xfb6893A38b32447066E4BEB4059C41Dda05eE1F8");
    
    // Try to get the game count first
    console.log("Getting game count...");
    const gameCount = await bettingPool.gameCount();
    console.log("Current game count:", gameCount.toString());
    
    // Try to create a game
    console.log("Creating a new game...");
    const tx = await bettingPool.createGame(
      "Test Game",  // homeTeam
      "Test Team 2", // awayTeam
      Math.floor(Date.now() / 1000) + 3600 // startTime
    );
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Game created successfully!");
    
    // Get the updated game count
    const newGameCount = await bettingPool.gameCount();
    console.log("New game count:", newGameCount.toString());
    
    // Get game details
    console.log("Getting game details...");
    const game = await bettingPool.games(1); // Get game with ID 1
    console.log("Game details:", {
      id: game.id.toString(),
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      startTime: new Date(Number(game.startTime) * 1000).toISOString(),
      status: game.status,
      totalBets: game.totalBets.toString()
    });
    
    // Place a bet on the game
    console.log("Placing a bet...");
    const betTx = await bettingPool.placeBet(1, 0, { value: ethers.parseEther("1.0") }); // Bet 1 ETN on home team win
    
    console.log("Transaction hash:", betTx.hash);
    console.log("Waiting for transaction confirmation...");
    await betTx.wait();
    console.log("Bet placed successfully!");
    
    // Get updated game details
    const updatedGame = await bettingPool.games(1);
    console.log("Updated game details:", {
      id: updatedGame.id.toString(),
      totalBets: updatedGame.totalBets.toString(),
      pools: updatedGame.pools.map(p => ethers.formatEther(p))
    });
    
  } catch (error) {
    console.error("Error:", error.message);
    // Log more details about the error
    if (error.error) {
      console.error("Additional error details:", error.error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
