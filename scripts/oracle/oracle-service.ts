import { ethers } from 'ethers';
import { FootballDataClient, SportsDataClient, MatchResult } from './api-clients';
import { ResultValidator } from './result-validator';
import { UPDATE_INTERVAL } from './config';

export class OracleService {
  private footballData: FootballDataClient;
  private sportsData: SportsDataClient;
  private validator: ResultValidator;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;
  private processedMatches: Set<number>;

  constructor(
    contract: ethers.Contract,
    wallet: ethers.Wallet,
    footballDataKey: string,
    sportsDataKey: string
  ) {
    this.footballData = new FootballDataClient();
    this.sportsData = new SportsDataClient();
    this.validator = new ResultValidator();
    this.contract = contract;
    this.wallet = wallet;
    this.processedMatches = new Set();
  }

  async start() {
    console.log('Starting Oracle Service...');
    this.monitorMatches();
  }

  private async monitorMatches() {
    try {
      // Get live matches from both APIs
      const [footballDataMatches, sportsDataMatches] = await Promise.all([
        this.footballData.getLiveMatches(),
        this.sportsData.getLiveMatches()
      ]);

      // Process finished matches
      const finishedMatches = [...footballDataMatches, ...sportsDataMatches]
        .filter(match => match.status === 'FINISHED')
        .filter(match => !this.processedMatches.has(match.matchId));

      for (const match of finishedMatches) {
        await this.processMatch(match.matchId);
      }

    } catch (error) {
      console.error('Error monitoring matches:', error);
    }

    // Schedule next update
    setTimeout(() => this.monitorMatches(), UPDATE_INTERVAL);
  }

  private async processMatch(matchId: number) {
    try {
      // Get results from both APIs
      const [footballDataResult, sportsDataResult] = await Promise.all([
        this.footballData.getMatchResult(matchId),
        this.sportsData.getMatchResult(matchId)
      ]);

      // Validate results
      const validatedResult = this.validator.validateResults([
        footballDataResult,
        sportsDataResult
      ]);

      if (!validatedResult) {
        console.log(`Could not validate results for match ${matchId}`);
        return;
      }

      // Submit result to blockchain
      await this.submitResult(validatedResult);
      this.processedMatches.add(matchId);

    } catch (error) {
      console.error(`Error processing match ${matchId}:`, error);
    }
  }

  private async submitResult(result: MatchResult) {
    try {
      const gameResult = this.validator.getResult(result);
      
      // Prepare transaction
      const tx = await this.contract.proposeResult(
        result.matchId,
        gameResult,
        result.homeScore,
        result.awayScore
      );

      console.log(`Submitting result for match ${result.matchId}:`, {
        homeTeam: result.homeTeam,
        awayTeam: result.awayTeam,
        score: `${result.homeScore}-${result.awayScore}`,
        result: gameResult,
        txHash: tx.hash
      });

      // Wait for confirmation
      await tx.wait();
      console.log(`Result submitted successfully for match ${result.matchId}`);

    } catch (error) {
      console.error(`Error submitting result for match ${result.matchId}:`, error);
    }
  }
}
