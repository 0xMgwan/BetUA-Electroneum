const { ethers } = require('ethers');
require('dotenv').config();

const BettingPoolArtifact = require('../artifacts/contracts/BettingPool.sol/BettingPool.json');
const CommentHubArtifact = require('../artifacts/contracts/CommentHub.sol/CommentHub.json');

async function main() {
  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ELECTRONEUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('Testing with account:', wallet.address);

    // Get contract instances
    const bettingPool = new ethers.Contract(
      process.env.BETTING_POOL_ADDRESS,
      BettingPoolArtifact.abi,
      wallet
    );
    const commentHub = new ethers.Contract(
      process.env.COMMENT_HUB_ADDRESS,
      CommentHubArtifact.abi,
      wallet
    );

    console.log('\n1. Creating a new game...');
    const now = Math.floor(Date.now() / 1000);
    const gameStartTime = now + 3600; // Start in 1 hour
    const tx1 = await bettingPool.createGame(
      "Manchester United",
      "Liverpool",
      gameStartTime
    );
    await tx1.wait();
    console.log('Game created! Waiting for transaction confirmation...');

    // Get the game ID (should be 1 if first game)
    const gameCount = await bettingPool.gameCount();
    const gameId = Number(gameCount);
    console.log('Game ID:', gameId);

    // Get game details
    const game = await bettingPool.games(gameId);
    console.log('\nGame Details:');
    console.log('Home Team:', game.homeTeam);
    console.log('Away Team:', game.awayTeam);
    console.log('Start Time:', new Date(Number(game.startTime) * 1000).toLocaleString());
    console.log('Status:', ['OPEN', 'STARTED', 'FINISHED'][Number(game.status)]);

    console.log('\n2. Placing bets...');
    // Place bet on home win (outcome 0)
    console.log('Placing bet on home win...');
    const betAmount = ethers.parseEther("1.0"); // 1 ETN
    const tx2 = await bettingPool.placeBet(gameId, 0, { value: betAmount });
    await tx2.wait();
    console.log('Bet placed successfully!');

    // Get betting pool details
    const game2 = await bettingPool.games(gameId);
    console.log('\nBetting Pool Status:');
    console.log('Total Bets:', ethers.formatEther(game2.totalBets), 'ETN');
    
    // Get pool amounts
    const pools = await bettingPool.getGamePools(gameId);
    console.log('Home Win Pool:', ethers.formatEther(pools[0]), 'ETN');
    console.log('Away Win Pool:', ethers.formatEther(pools[1]), 'ETN');
    console.log('Draw Pool:', ethers.formatEther(pools[2]), 'ETN');

    console.log('\n3. Testing comments...');
    // Add a comment
    const tx3 = await commentHub.addComment(gameId, "Great match coming up!");
    await tx3.wait();
    console.log('Comment added successfully!');

    // Get comment count
    const commentCount = await commentHub.getCommentCount(gameId);
    console.log('Total comments:', Number(commentCount));

    // Get latest comment
    const comment = await commentHub.getComment(gameId, Number(commentCount) - 1);
    console.log('Latest comment:', comment.text);
    console.log('Comment author:', comment.author);
    console.log('Comment timestamp:', new Date(Number(comment.timestamp) * 1000).toLocaleString());

    console.log('\n4. Checking user stats...');
    // Get user stats
    const userStats = await bettingPool.userStats(wallet.address);
    console.log('Total Bets:', Number(userStats.totalBets));
    console.log('Total Wins:', Number(userStats.totalWins));
    console.log('Total Amount Bet:', ethers.formatEther(userStats.totalAmount), 'ETN');
    console.log('Total Winnings:', ethers.formatEther(userStats.totalWinnings), 'ETN');
    console.log('Rank:', Number(userStats.rank));
    console.log('Reputation:', Number(userStats.reputation));

    console.log('\nAll tests completed successfully! 🎉');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
