import { useState } from 'react';
import { useContract } from '../hooks/useContract';

interface Bet {
  id: number;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  amount: string;
  odds: number;
  selectedOutcome: number; // 1 for home, 0 for draw, 2 for away
  status: 'active' | 'won' | 'lost';
  actualOutcome?: number;
  potentialWinnings: string;
  timestamp: number;
  claimed: boolean;
}

const mockBets: Bet[] = [
  {
    id: 1,
    matchId: 1,
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    amount: '0.1',
    odds: 2.5,
    selectedOutcome: 1,
    status: 'won',
    actualOutcome: 1,
    potentialWinnings: '0.25',
    timestamp: Date.now() - 86400000, // 1 day ago
    claimed: false
  },
  {
    id: 2,
    matchId: 2,
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    amount: '0.2',
    odds: 2.1,
    selectedOutcome: 1,
    status: 'active',
    potentialWinnings: '0.42',
    timestamp: Date.now(),
    claimed: false
  }
];

export default function MyBets() {
  const { signer, contract, connectWallet, isConnecting } = useContract();
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClaimWinnings = async (bet: Bet) => {
    if (!signer || !contract) {
      await connectWallet();
      return;
    }

    setIsLoading(prev => ({ ...prev, [bet.id]: true }));
    try {
      // In a real app, this would be a contract call
      // await contract.claimWinnings(bet.id);
      console.log('Claiming winnings for bet:', bet.id);
      
      // Update UI immediately
      bet.claimed = true;
      setSuccessMessage(`Successfully claimed ${bet.potentialWinnings} ETH!`);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error claiming winnings:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, [bet.id]: false }));
    }
  };

  const getOutcomeText = (outcome: number) => {
    switch (outcome) {
      case 1: return 'Home Win';
      case 0: return 'Draw';
      case 2: return 'Away Win';
      default: return 'Unknown';
    }
  };

  if (!signer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Connect your wallet to view your bets</p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isConnecting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500 text-white rounded-lg">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-6">My Bets</h2>

      {/* Bets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockBets.map((bet) => (
          <div
            key={bet.id}
            className={`p-6 rounded-lg ${
              bet.status === 'active'
                ? 'bg-navy-800'
                : bet.status === 'won'
                ? 'bg-navy-800 border-2 border-green-500'
                : 'bg-navy-800 border-2 border-red-500'
            }`}
          >
            {/* Match Info */}
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-1">
                {new Date(bet.timestamp).toLocaleDateString()}
              </div>
              <div className="text-white font-medium">
                {bet.homeTeam} vs {bet.awayTeam}
              </div>
            </div>

            {/* Bet Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">{bet.amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Prediction:</span>
                <span className="text-white">{getOutcomeText(bet.selectedOutcome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Odds:</span>
                <span className="text-white">{bet.odds}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Winnings:</span>
                <span className="text-white">{bet.potentialWinnings} ETH</span>
              </div>
              {bet.status !== 'active' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Result:</span>
                  <span className={bet.status === 'won' ? 'text-green-500' : 'text-red-500'}>
                    {bet.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {bet.status === 'won' && !bet.claimed && (
              <button
                onClick={() => handleClaimWinnings(bet)}
                disabled={isLoading[bet.id]}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  isLoading[bet.id]
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading[bet.id] ? 'Claiming...' : 'Claim Winnings'}
              </button>
            )}
            {bet.status === 'won' && bet.claimed && (
              <div className="text-center text-green-500 font-medium">
                Winnings Claimed ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
