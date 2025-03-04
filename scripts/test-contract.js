const hre = require("hardhat");
require('dotenv').config();

async function main() {
  try {
    console.log("Network name:", hre.network.name);
    console.log("Network config:", hre.network.config);

    // Connect to the contract
    const BettingPool = await hre.ethers.getContractFactory("BettingPool");
    const bettingPool = BettingPool.attach(process.env.BETTING_POOL_ADDRESS);
    console.log("\nConnected to BettingPool at:", bettingPool.address);

    // Get the deployer's address (which should be the oracle)
    const [deployer] = await hre.ethers.getSigners();
    console.log("Interacting with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // 1. Check if we're the oracle
    const oracle = await bettingPool.oracle();
    console.log("\nOracle address:", oracle);
    console.log("Are we the oracle?", oracle === deployer.address);

    // 2. Create a test game
    console.log("\nCreating a test game...");
    const gameId = Math.floor(Date.now() / 1000); // Use timestamp as unique ID
    const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    try {
      console.log("Estimating gas for createGame...");
      const gasEstimate = await bettingPool.estimateGas.createGame(
        gameId,
        "Arsenal",
        "Chelsea",
        startTime
      );
      console.log("Gas estimate:", gasEstimate.toString());

      console.log("Sending transaction...");
      const tx = await bettingPool.createGame(
        gameId,
        "Arsenal",
        "Chelsea",
        startTime,
        { gasLimit: Math.floor(gasEstimate.toNumber() * 1.2) } // Add 20% buffer
      );
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Game created successfully!");
      console.log("Transaction hash:", receipt.transactionHash);
      console.log("Block number:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
    } catch (error) {
      console.log("Error creating game:", error.message);
      if (error.transaction) {
        console.log("Failed transaction:", error.transaction);
      }
    }

    // 3. Get game details
    console.log("\nFetching game details...");
    const game = await bettingPool.getGame(gameId);
    console.log("Game details:", {
      id: game.id.toString(),
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      startTime: new Date(game.startTime * 1000).toISOString(),
      status: game.status,
      result: game.result,
      totalBets: game.totalBets.toString()
    });

    // 4. Place a test bet
    console.log("\nPlacing a test bet...");
    const betAmount = hre.ethers.utils.parseEther("1.0"); // 1 ETN
    try {
      console.log("Estimating gas for placeBet...");
      const gasEstimate = await bettingPool.estimateGas.placeBet(
        gameId,
        0,
        { value: betAmount }
      );
      console.log("Gas estimate:", gasEstimate.toString());

      console.log("Sending transaction...");
      const tx = await bettingPool.placeBet(
        gameId,
        0,
        { value: betAmount, gasLimit: Math.floor(gasEstimate.toNumber() * 1.2) } // Add 20% buffer
      );
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Bet placed successfully!");
      console.log("Transaction hash:", receipt.transactionHash);
      console.log("Block number:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
    } catch (error) {
      console.log("Error placing bet:", error.message);
      if (error.transaction) {
        console.log("Failed transaction:", error.transaction);
      }
    }

    // 5. Check bet amount
    const betAmount1 = await bettingPool.getBetAmount(gameId, 0, deployer.address);
    console.log("\nOur bet amount:", hre.ethers.utils.formatEther(betAmount1), "ETN");

    // 6. Set game result
    console.log("\nSetting game result...");
    try {
      console.log("Estimating gas for setGameResult...");
      const gasEstimate = await bettingPool.estimateGas.setGameResult(
        gameId,
        1
      );
      console.log("Gas estimate:", gasEstimate.toString());

      console.log("Sending transaction...");
      const tx = await bettingPool.setGameResult(
        gameId,
        1,
        { gasLimit: Math.floor(gasEstimate.toNumber() * 1.2) } // Add 20% buffer
      );
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Game result set successfully!");
      console.log("Transaction hash:", receipt.transactionHash);
      console.log("Block number:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
    } catch (error) {
      console.log("Error setting result:", error.message);
      if (error.transaction) {
        console.log("Failed transaction:", error.transaction);
      }
    }

    // 7. Get updated game details
    const updatedGame = await bettingPool.getGame(gameId);
    console.log("\nUpdated game status:", updatedGame.status);
    console.log("Updated game result:", updatedGame.result);

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
