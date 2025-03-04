import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy BettingPool
  const BettingPool = await ethers.getContractFactory("contracts/BettingPool.sol:BettingPool");
  const bettingPool = await BettingPool.deploy({ value: ethers.utils.parseEther("100") });
  await bettingPool.deployed();
  console.log("BettingPool deployed to:", bettingPool.address);

  // Add deployer as oracle
  console.log("Adding deployer as oracle...");
  await bettingPool.addOracle(deployer.address, "Initial Oracle", { value: ethers.utils.parseEther("100") });

  // Deploy CommentHub
  const CommentHub = await ethers.getContractFactory("contracts/CommentHub.sol:CommentHub");
  const commentHub = await CommentHub.deploy();
  await commentHub.deployed();
  console.log("CommentHub deployed to:", commentHub.address);

  // Create sample games
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 3600;
  const oneDay = 86400;

  const games = [
    {
      gameId: 1,
      homeTeam: "Arsenal",
      awayTeam: "Manchester City",
      league: "Premier League",
      season: "2024/25",
      matchDay: "Week 28",
      startTime: now + oneHour
    },
    {
      gameId: 2,
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      league: "La Liga",
      season: "2024/25",
      matchDay: "Week 30",
      startTime: now + oneDay
    },
    {
      gameId: 3,
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      league: "Bundesliga",
      season: "2024/25",
      matchDay: "Week 27",
      startTime: now + oneDay + oneHour
    }
  ];

  console.log("Creating sample games...");
  
  for (const game of games) {
    await bettingPool.createGame(
      game.gameId,
      game.homeTeam,
      game.awayTeam,
      game.league,
      game.season,
      game.matchDay,
      game.startTime
    );
    console.log(`Created game ${game.gameId}: ${game.homeTeam} vs ${game.awayTeam}`);
  }

  // Update .env files with contract addresses
  const fs = require('fs');
  
  // Update root .env
  const rootEnvPath = '.env';
  const rootEnvContent = `VITE_CONTRACT_ADDRESS="${bettingPool.address}"
VITE_COMMENT_HUB_ADDRESS="${commentHub.address}"`;
  
  fs.writeFileSync(rootEnvPath, rootEnvContent);
  console.log("Updated root .env file with contract addresses");

  // Update frontend .env
  const frontendEnvPath = 'frontend/.env';
  const frontendEnvContent = `VITE_CONTRACT_ADDRESS="${bettingPool.address}"
VITE_COMMENT_HUB_ADDRESS="${commentHub.address}"`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log("Updated frontend .env file with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
