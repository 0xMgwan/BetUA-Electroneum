import { ethers } from "hardhat";

async function main() {
  try {
    // Get the network and signer
    const [deployer] = await ethers.getSigners();
    if (!deployer) {
      throw new Error("No deployer account found");
    }

    console.log("Network:", await ethers.provider.getNetwork().then(n => `${n.name} (${n.chainId})`));
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

    // Deploy the contract with 100 ETH as initial oracle stake
    const BettingPool = await ethers.getContractFactory("BettingPool");
    console.log("Deploying BettingPool...");
    const bettingPool = await BettingPool.deploy({ value: ethers.utils.parseEther("100") });
    await bettingPool.deployed();

    console.log("BettingPool deployed to:", bettingPool.address);

    // Create some test games for the hackathon demo
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;

    const games = [
      {
        gameId: 1,
        homeTeam: "Arsenal",
        awayTeam: "Manchester City",
        league: "Premier League",
        season: "2024/2025",
        matchDay: "Round 28",
        startTime: now + oneHour // Starts in 1 hour
      },
      {
        gameId: 2,
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        league: "La Liga",
        season: "2024/2025",
        matchDay: "El Clasico",
        startTime: now + 2 * oneHour // Starts in 2 hours
      },
      {
        gameId: 3,
        homeTeam: "Bayern Munich",
        awayTeam: "Borussia Dortmund",
        league: "Bundesliga",
        season: "2024/2025",
        matchDay: "Der Klassiker",
        startTime: now + 3 * oneHour // Starts in 3 hours
      },
      {
        gameId: 4,
        homeTeam: "PSG",
        awayTeam: "Marseille",
        league: "Ligue 1",
        season: "2024/2025",
        matchDay: "Le Classique",
        startTime: now + 4 * oneHour // Starts in 4 hours
      },
      {
        gameId: 5,
        homeTeam: "Inter Milan",
        awayTeam: "AC Milan",
        league: "Serie A",
        season: "2024/2025",
        matchDay: "Derby della Madonnina",
        startTime: now + 5 * oneHour // Starts in 5 hours
      }
    ];

    console.log("\nCreating test games for the demo...");
    
    for (const game of games) {
      try {
        console.log(`Creating game ${game.gameId}: ${game.homeTeam} vs ${game.awayTeam}...`);
        const tx = await bettingPool.createGame(
          game.gameId,
          game.homeTeam,
          game.awayTeam,
          game.league,
          game.season,
          game.matchDay,
          game.startTime
        );
        await tx.wait();
        console.log(`✓ Game ${game.gameId} created successfully`);
      } catch (error) {
        console.error(`✗ Failed to create game ${game.gameId}:`, error);
      }
    }

    // Update the frontend's .env with the new contract address
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../../frontend/.env');
    fs.writeFileSync(envPath, `VITE_CONTRACT_ADDRESS=${bettingPool.address}\n`);
    
    console.log("\n✓ Updated frontend .env with new contract address");
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("Contract Address:", bettingPool.address);
    console.log("Total Games Created:", games.length);
    console.log("\nReady for demo! 🚀");
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
