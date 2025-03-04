require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const http = require('http');
const socketIo = require('socket.io');
const { blockchainProvider } = require('../../src/utils/provider');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize blockchain provider
const provider = blockchainProvider.initialize();

// Contract ABIs
const BettingPoolABI = require('../contracts/BettingPool.json');
const SpecificBetABI = require('../contracts/SpecificBet.json');
const CommentHubABI = require('../contracts/CommentHub.json');

// Contract instances
const bettingPool = new ethers.Contract(
  process.env.BETTING_POOL_ADDRESS,
  BettingPoolABI,
  provider
);

const specificBet = new ethers.Contract(
  process.env.SPECIFIC_BET_ADDRESS,
  SpecificBetABI,
  provider
);

const commentHub = new ethers.Contract(
  process.env.COMMENT_HUB_ADDRESS,
  CommentHubABI,
  provider
);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const status = await blockchainProvider.checkConnection();
    res.json({
      status: 'ok',
      blockchain: status
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Routes
app.get('/api/games', async (req, res) => {
  try {
    const gameCount = await bettingPool.gameCount();
    const games = [];
    
    for (let i = 1; i <= gameCount; i++) {
      const game = await bettingPool.games(i);
      games.push(game);
    }
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

app.get('/api/game/:gameId/comments', async (req, res) => {
  try {
    const { gameId } = req.params;
    const comments = await commentHub.getGameComments(gameId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/game/:gameId/comments', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { content } = req.body;
    const signer = provider.getSigner();
    
    // Add comment directly to blockchain
    const tx = await commentHub.connect(signer).addComment(gameId, content);
    const receipt = await tx.wait();
    
    // Get the comment details from the event
    const event = receipt.events.find(e => e.event === 'CommentAdded');
    const comment = {
      gameId,
      id: event.args.commentId,
      author: event.args.author,
      content: event.args.content,
      timestamp: Math.floor(Date.now() / 1000),
      tips: 0
    };
    
    // Notify connected clients
    io.to(`game_${gameId}`).emit('new_comment', comment);
    
    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('join_game', (gameId) => {
    socket.join(`game_${gameId}`);
  });
  
  socket.on('leave_game', (gameId) => {
    socket.leave(`game_${gameId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Listen for blockchain events
bettingPool.on('GameCreated', (gameId, homeTeam, awayTeam, startTime) => {
  io.emit('game_created', { gameId, homeTeam, awayTeam, startTime });
});

bettingPool.on('BetPlaced', (gameId, bettor, amount, prediction) => {
  io.to(`game_${gameId}`).emit('bet_placed', { gameId, bettor, amount, prediction });
});

commentHub.on('CommentAdded', (gameId, commentId, author, content) => {
  const comment = {
    gameId,
    id: commentId,
    author,
    content,
    timestamp: Math.floor(Date.now() / 1000),
    tips: 0
  };
  io.to(`game_${gameId}`).emit('new_comment', comment);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
