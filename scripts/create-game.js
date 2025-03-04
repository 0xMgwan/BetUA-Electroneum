const hre = require("hardhat");

async function main() {
  // Get the contract instance
  const bettingPool = await hre.ethers.getContractAt(
    "contracts/BettingPool.sol:BettingPool",
    "0x72ff093cea6035fa395c0910b006af2dc4d4e9f5" // Your deployed contract address
  );

  const startTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

  try {
    // Create a game
    const tx = await bettingPool.createGame(
      1, // gameId
      "Manchester United",
      "Liverpool",
      "Premier League",
      "2024/2025",
      "Round 1",
      startTime
    );

    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("Game created successfully!");
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
