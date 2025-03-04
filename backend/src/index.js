const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');
const winston = require('winston');
require('dotenv').config();

// Import contract ABIs
const BettingPool = require('../artifacts/contracts/BettingPool.sol/BettingPool.json');
const CommentHub = require('../artifacts/contracts/CommentHub.sol/CommentHub.json');
const SpecificBet = require('../artifacts/contracts/SpecificBet.sol/SpecificBet.json');

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize Express app
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
app.use(helmet());
app.use(express.json());

// Initialize blockchain connection
const provider = new ethers.providers.JsonRpcProvider(process.env.ELECTRONEUM_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const bettingPool = new ethers.Contract(
  process.env.BETTING_POOL_ADDRESS,
  BettingPool.abi,
  wallet
);

const commentHub = new ethers.Contract(
  process.env.COMMENT_HUB_ADDRESS,
  CommentHub.abi,
  wallet
);

const specificBet = new ethers.Contract(
  process.env.SPECIFIC_BET_ADDRESS,
  SpecificBet.abi,
  wallet
);

// WebSocket connection
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// API Routes
app.get('/api/games', async (req, res) => {
  try {
    // TODO: Implement game listing logic
    res.json({ message: "Games endpoint" });
  } catch (error) {
    logger.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await bettingPool.getGame(gameId);
    res.json(game);
  } catch (error) {
    logger.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
