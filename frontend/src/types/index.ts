import { ethers } from 'ethers';

export enum GameStatus {
  ACTIVE = 0,
  FINALIZED = 1,
  CANCELLED = 2
}

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: number;
  status: GameStatus;
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

export interface FormattedGame {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: number;
  league: string;
  season: string;
  matchDay: string;
  status: GameStatus;
  result: {
    result: number;
    homeScore: number;
    awayScore: number;
    submittedAt: number;
    confirmations: number;
    dataSource: any;
  } | null;
  pools: string[];
  totalBets: string;
  finalizedAt: number;
}

export interface ContractContextType {
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  commentHub: ethers.Contract | null;
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  addComment?: (gameId: number, content: string) => Promise<void>;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
