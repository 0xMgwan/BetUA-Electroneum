const ethers = require('ethers');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const BETTING_POOL_ABI = [
    "function setGameResult(uint256 gameId, uint8 result) external",
    "function createGame(uint256 gameId, string memory homeTeam, string memory awayTeam, uint256 startTime) external"
];

// For demo/hackathon, we'll use a free soccer API
const FOOTBALL_API_URL = 'https://api.football-data.org/v2';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || 'demo'; // Get a free key from football-data.org

const provider = new ethers.providers.JsonRpcProvider(process.env.ELECTRONEUM_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const bettingPool = new ethers.Contract(process.env.BETTING_POOL_ADDRESS, BETTING_POOL_ABI, wallet);

// Create a new game
app.post('/games', async (req, res) => {
    try {
        const { gameId, homeTeam, awayTeam, startTime } = req.body;
        
        const tx = await bettingPool.createGame(gameId, homeTeam, awayTeam, startTime);
        await tx.wait();
        
        res.json({ success: true, transactionHash: tx.hash });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update game result
app.post('/games/:gameId/result', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { result } = req.body;
        
        const tx = await bettingPool.setGameResult(gameId, result);
        await tx.wait();
        
        res.json({ success: true, transactionHash: tx.hash });
    } catch (error) {
        console.error('Error updating game result:', error);
        res.status(500).json({ error: error.message });
    }
});

// Demo: Fetch real soccer matches (for hackathon demo)
app.get('/fetch-matches', async (req, res) => {
    try {
        const response = await axios.get(`${FOOTBALL_API_URL}/matches`, {
            headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
        });
        
        const matches = response.data.matches.map(match => ({
            gameId: match.id,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            startTime: new Date(match.utcDate).getTime() / 1000,
            status: match.status
        }));
        
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Oracle service running on port ${PORT}`);
});
