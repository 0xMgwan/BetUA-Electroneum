export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: number;
  status: number;
  result: number;
  totalBets: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

declare global {
  interface Window {
    ethereum: any;
  }
}
