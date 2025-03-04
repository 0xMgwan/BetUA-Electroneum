import { ethers } from 'ethers';

export const mockMatches = [
  {
    id: '1',
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    startTime: 1709644800, // March 5, 2024 20:00 UTC
    odds: {
      home: '2.50',
      draw: '3.20',
      away: '2.80'
    },
    bets: {
      home: '1.2K',
      draw: '800',
      away: '1.5K'
    },
    liquidity: '10.5K ETN',
    traded: '3.5K ETN'
  },
  {
    id: '2',
    league: 'NBA',
    homeTeam: 'LA Lakers',
    awayTeam: 'Golden State',
    startTime: 1709650200, // March 5, 2024 21:30 UTC
    odds: {
      home: '1.90',
      draw: '15.00',
      away: '1.95'
    },
    bets: {
      home: '2.1K',
      draw: '100',
      away: '1.9K'
    },
    liquidity: '15.2K ETN',
    traded: '4.1K ETN'
  },
  {
    id: '3',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    startTime: 1709657400, // March 5, 2024 23:30 UTC
    odds: {
      home: '2.10',
      draw: '3.40',
      away: '3.20'
    },
    bets: {
      home: '1.8K',
      draw: '750',
      away: '900'
    },
    liquidity: '12.8K ETN',
    traded: '3.45K ETN'
  }
];

export const mockLeaderboard = [
  {
    address: '0x1234...5678',
    earnings: ethers.utils.parseEther('125.5'),
    winRate: 0.68,
    totalTrades: 245,
    weeklyGrowth: 0.15
  },
  {
    address: '0x8765...4321',
    earnings: ethers.utils.parseEther('98.2'),
    winRate: 0.62,
    totalTrades: 180,
    weeklyGrowth: 0.08
  },
  {
    address: '0x9876...1234',
    earnings: ethers.utils.parseEther('76.4'),
    winRate: 0.59,
    totalTrades: 156,
    weeklyGrowth: 0.12
  },
  {
    address: '0x4567...8901',
    earnings: ethers.utils.parseEther('54.8'),
    winRate: 0.55,
    totalTrades: 120,
    weeklyGrowth: 0.05
  },
  {
    address: '0x2345...6789',
    earnings: ethers.utils.parseEther('42.3'),
    winRate: 0.52,
    totalTrades: 95,
    weeklyGrowth: 0.07
  }
];

export const mockComments = [
  {
    id: '1',
    matchId: '1',
    author: '0x1234...5678',
    content: 'Real Madrid looking strong after their last win. Taking them at these odds.',
    timestamp: 1709558400, // March 4, 2024
    likes: 12
  },
  {
    id: '2',
    matchId: '1',
    author: '0x8765...4321',
    content: 'City has been inconsistent away from home. This could be close.',
    timestamp: 1709565600,
    likes: 8
  },
  {
    id: '3',
    matchId: '2',
    author: '0x9876...1234',
    content: 'Lakers at home is always a good bet. Curry might be rested.',
    timestamp: 1709572800,
    likes: 15
  }
];
