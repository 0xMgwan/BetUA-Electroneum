const hre = require("hardhat");

async function main() {
  const bettingPool = await hre.ethers.getContractAt(
    "contracts/BettingPool.sol:BettingPool",
    "0x72ff093cea6035fa395c0910b006af2dc4d4e9f5"
  );

  try {
    const game = await bettingPool.games(1); // Get game with ID 1
    console.log("Game Details:");
    console.log("-------------");
    console.log("ID:", game.id.toString());
    console.log("Home Team:", game.homeTeam);
    console.log("Away Team:", game.awayTeam);
    console.log("League:", game.league);
    console.log("Season:", game.season);
    console.log("Match Day:", game.matchDay);
    console.log("Start Time:", new Date(game.startTime * 1000).toLocaleString());
    console.log("Status:", ["PENDING", "ACTIVE", "FINISHED", "CANCELLED"][game.status]);
    console.log("Total Bets:", hre.ethers.utils.formatEther(game.totalBets), "ETN");
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
