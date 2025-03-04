const axios = require('axios');
const { ethers } = require('ethers');
const cron = require('node-cron');
const winston = require('winston');

class OracleService {
  constructor(bettingPoolContract, logger) {
    this.bettingPool = bettingPoolContract;
    this.logger = logger;
    this.apiKey = process.env.FOOTBALL_DATA_API_KEY;
  }

  async fetchLiveGames() {
    try {
      const response = await axios.get('http://api.football-data.org/v2/matches', {
        headers: { 'X-Auth-Token': this.apiKey }
      });
      
      return response.data.matches.filter(match => match.status === 'LIVE');
    } catch (error) {
      this.logger.error('Error fetching live games:', error);
      return [];
    }
  }

  async createGame(match) {
    try {
      const gameId = ethers.utils.id(`${match.id}-${match.utcDate}`);
      const startTime = Math.floor(new Date(match.utcDate).getTime() / 1000);
      
      const tx = await this.bettingPool.createGame(
        gameId,
        match.homeTeam.name,
        match.awayTeam.name,
        startTime
      );
      
      await tx.wait();
      this.logger.info(`Created game ${gameId} for match ${match.id}`);
      
      return gameId;
    } catch (error) {
      this.logger.error('Error creating game:', error);
      return null;
    }
  }

  async updateGameResult(gameId, result) {
    try {
      const tx = await this.bettingPool.setGameResult(gameId, result);
      await tx.wait();
      this.logger.info(`Updated game ${gameId} with result ${result}`);
    } catch (error) {
      this.logger.error('Error updating game result:', error);
    }
  }

  startMonitoring() {
    // Check for new games every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      const liveGames = await this.fetchLiveGames();
      
      for (const game of liveGames) {
        // Create new games
        if (game.status === 'SCHEDULED') {
          await this.createGame(game);
        }
        
        // Update finished games
        if (game.status === 'FINISHED') {
          const result = this.calculateResult(game.score);
          const gameId = ethers.utils.id(`${game.id}-${game.utcDate}`);
          await this.updateGameResult(gameId, result);
        }
      }
    });
  }

  calculateResult(score) {
    if (score.fullTime.homeTeam > score.fullTime.awayTeam) {
      return 1; // HOME_WIN
    } else if (score.fullTime.homeTeam < score.fullTime.awayTeam) {
      return 2; // AWAY_WIN
    } else {
      return 3; // DRAW
    }
  }
}

module.exports = OracleService;
