import axios from 'axios';
import { API_CONFIGS, RETRY_ATTEMPTS, RETRY_DELAY } from './config';

export interface MatchResult {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'FINISHED' | 'LIVE' | 'NOT_STARTED';
  league: string;
  season: string;
  matchDay: string;
  timestamp: number;
  source: string;
}

class BaseApiClient {
  protected async retryRequest(fn: () => Promise<any>): Promise<any> {
    for (let i = 0; i < RETRY_ATTEMPTS; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === RETRY_ATTEMPTS - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
}

export class FootballDataClient extends BaseApiClient {
  private readonly api = axios.create({
    baseURL: API_CONFIGS.FOOTBALL_DATA.BASE_URL,
    headers: API_CONFIGS.FOOTBALL_DATA.HEADERS
  });

  async getMatchResult(matchId: number): Promise<MatchResult> {
    const response = await this.retryRequest(() => 
      this.api.get(`${API_CONFIGS.FOOTBALL_DATA.ENDPOINTS.MATCH}/${matchId}`)
    );

    const match = response.data;
    return {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: match.score.fullTime.home || 0,
      awayScore: match.score.fullTime.away || 0,
      status: match.status === 'FINISHED' ? 'FINISHED' : 
              match.status === 'IN_PLAY' ? 'LIVE' : 'NOT_STARTED',
      league: match.competition.name,
      season: match.season.id.toString(),
      matchDay: `Matchday ${match.matchday}`,
      timestamp: new Date(match.utcDate).getTime(),
      source: 'Football-Data'
    };
  }

  async getLiveMatches(): Promise<MatchResult[]> {
    const response = await this.retryRequest(() =>
      this.api.get(API_CONFIGS.FOOTBALL_DATA.ENDPOINTS.MATCHES, {
        params: { status: ['LIVE', 'IN_PLAY', 'FINISHED'].join(',') }
      })
    );

    return response.data.matches.map((match: any) => ({
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: match.score.fullTime.home || 0,
      awayScore: match.score.fullTime.away || 0,
      status: match.status === 'FINISHED' ? 'FINISHED' : 
              match.status === 'IN_PLAY' ? 'LIVE' : 'NOT_STARTED',
      league: match.competition.name,
      season: match.season.id.toString(),
      matchDay: `Matchday ${match.matchday}`,
      timestamp: new Date(match.utcDate).getTime(),
      source: 'Football-Data'
    }));
  }
}

export class SportsDataClient extends BaseApiClient {
  private readonly api = axios.create({
    baseURL: API_CONFIGS.SPORTS_DATA.BASE_URL,
    headers: API_CONFIGS.SPORTS_DATA.HEADERS
  });

  async getMatchResult(matchId: number): Promise<MatchResult> {
    const date = new Date().toISOString().split('T')[0];
    const response = await this.retryRequest(() =>
      this.api.get(API_CONFIGS.SPORTS_DATA.ENDPOINTS.MATCH, {
        params: { date }
      })
    );

    const match = response.data.find((m: any) => m.GameId === matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    return {
      matchId,
      homeTeam: match.HomeTeamName,
      awayTeam: match.AwayTeamName,
      homeScore: match.HomeTeamScore,
      awayScore: match.AwayTeamScore,
      status: match.Status === 'Final' ? 'FINISHED' :
              match.Status === 'InProgress' ? 'LIVE' : 'NOT_STARTED',
      league: match.CompetitionName,
      season: match.Season.toString(),
      matchDay: `Round ${match.Round}`,
      timestamp: new Date(match.DateTime).getTime(),
      source: 'SportsData'
    };
  }

  async getLiveMatches(): Promise<MatchResult[]> {
    const response = await this.retryRequest(() =>
      this.api.get(API_CONFIGS.SPORTS_DATA.ENDPOINTS.SCORES)
    );

    return response.data.map((match: any) => ({
      matchId: match.GameId,
      homeTeam: match.HomeTeamName,
      awayTeam: match.AwayTeamName,
      homeScore: match.HomeTeamScore,
      awayScore: match.AwayTeamScore,
      status: match.Status === 'Final' ? 'FINISHED' :
              match.Status === 'InProgress' ? 'LIVE' : 'NOT_STARTED',
      league: match.CompetitionName,
      season: match.Season.toString(),
      matchDay: `Round ${match.Round}`,
      timestamp: new Date(match.DateTime).getTime(),
      source: 'SportsData'
    }));
  }
}
