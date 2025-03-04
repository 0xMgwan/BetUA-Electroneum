import { ethers } from 'ethers';
import { BigNumber } from 'ethers';

export interface ContractContextType {
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  commentHub: ethers.Contract | null;
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
}

export enum GameStatus {
  PENDING = 0,
  ACTIVE = 1,
  FINISHED = 2,
  CANCELLED = 3
}

export enum BetOutcome {
  HOME = 1,
  AWAY = 2,
  DRAW = 3
}

export interface GameResult {
  result: number;
  homeScore: BigNumber;
  awayScore: BigNumber;
  submittedAt: BigNumber;
  confirmations: BigNumber;
  dataSource: string;
}

export interface Game {
  id: BigNumber;
  homeTeam: string;
  awayTeam: string;
  startTime: BigNumber;
  league: string;
  season: string;
  matchDay: string;
  status: GameStatus;
  totalBets: BigNumber;
  pools: BigNumber[];
  result: GameResult | null;
  finalizedAt: BigNumber;
}

export interface Bet {
  id: number;
  gameId: number;
  bettor: string;
  amount: BigNumber;
  prediction: BetOutcome;
  claimed: boolean;
  won: boolean;
  timestamp: BigNumber;
}

export interface Comment {
  id: number;
  gameId: number;
  author: string;
  content: string;
  timestamp: BigNumber;
  likes: BigNumber;
}

export interface UserStats {
  totalBets: BigNumber;
  totalWins: BigNumber;
  totalAmount: BigNumber;
  betGameIds: BigNumber[];
}
