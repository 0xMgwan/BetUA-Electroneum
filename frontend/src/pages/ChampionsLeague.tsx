import { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const mockMatches = [
  {
    id: 1,
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    startTime: new Date('2024-03-05T17:20:00').getTime(),
    odds: { home: 2.50, draw: 3.20, away: 2.80 },
    round: 'Round of 16',
    comments: []
  },
  {
    id: 2,
    league: 'UEFA Champions League',
    homeTeam: 'PSG',
    awayTeam: 'Bayern Munich',
    startTime: new Date('2024-03-06T20:00:00').getTime(),
    odds: { home: 2.20, draw: 3.50, away: 2.90 },
    round: 'Round of 16',
    comments: []
  },
  {
    id: 3,
    league: 'UEFA Champions League',
    homeTeam: 'Inter Milan',
    awayTeam: 'Atletico Madrid',
    startTime: new Date('2024-03-06T22:00:00').getTime(),
    odds: { home: 2.15, draw: 3.30, away: 3.10 },
    round: 'Round of 16',
    comments: []
  },
  {
    id: 4,
    league: 'UEFA Champions League',
    homeTeam: 'Porto',
    awayTeam: 'Arsenal',
    startTime: new Date('2024-03-07T20:00:00').getTime(),
    odds: { home: 2.70, draw: 3.40, away: 2.50 },
    round: 'Round of 16',
    comments: []
  },
  {
    id: 5,
    league: 'UEFA Champions League',
    homeTeam: 'Napoli',
    awayTeam: 'Barcelona',
    startTime: new Date('2024-03-12T20:00:00').getTime(),
    odds: { home: 2.40, draw: 3.30, away: 2.75 },
    round: 'Round of 16',
    comments: []
  },
  {
    id: 6,
    league: 'UEFA Champions League',
    homeTeam: 'RB Leipzig',
    awayTeam: 'Real Madrid',
    startTime: new Date('2024-03-13T20:00:00').getTime(),
    odds: { home: 3.10, draw: 3.40, away: 2.20 },
    round: 'Round of 16',
    comments: []
  }
];

function ChampionsLeague() {
  const { signer, contract, connectWallet, isConnecting, isConnected } = useContract();
  const [betAmount, setBetAmount] = useState<{ [key: string]: string }>({});
  const [selectedOutcome, setSelectedOutcome] = useState<{ [key: string]: number | null }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [selectedRound, setSelectedRound] = useState<string>('R16');

  const toggleComments = (matchId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const handleBetAmountChange = (matchId: number, value: string) => {
    setBetAmount(prev => ({
      ...prev,
      [matchId]: value
    }));
  };

  const handleOutcomeSelect = (matchId: number, outcome: number) => {
    setSelectedOutcome(prev => ({
      ...prev,
      [matchId]: outcome
    }));
  };

  const handleBet = async (matchId: number) => {
    if (!signer || !contract) {
      await connectWallet();
      return;
    }

    setIsLoading(prev => ({ ...prev, [matchId]: true }));
    try {
      // Implement betting logic here
      console.log('Placing bet...', { matchId, amount: betAmount[matchId], outcome: selectedOutcome[matchId] });
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">UEFA Champions League</h1>
      
      {/* Round Filter */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setSelectedRound('R16')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedRound === 'R16' ? 'bg-indigo-600 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
          }`}
        >
          Round of 16
        </button>
        <button
          onClick={() => setSelectedRound('QF')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedRound === 'QF' ? 'bg-indigo-600 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
          }`}
        >
          Quarter Finals
        </button>
        <button
          onClick={() => setSelectedRound('SF')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedRound === 'SF' ? 'bg-indigo-600 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
          }`}
        >
          Semi Finals
        </button>
        <button
          onClick={() => setSelectedRound('F')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedRound === 'F' ? 'bg-indigo-600 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
          }`}
        >
          Final
        </button>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockMatches.map((match) => (
          <div key={match.id} className="bg-navy-800 rounded-lg p-6">
            {/* Match Header */}
            <div className="flex flex-col mb-6">
              <div className="text-indigo-400 font-medium mb-2">{match.round}</div>
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">
                  {match.homeTeam} vs {match.awayTeam}
                </div>
                <div className="text-right">
                  <div className="text-gray-400">{new Date(match.startTime).toLocaleDateString()}</div>
                  <div className="text-gray-400">
                    {new Date(match.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Betting Options */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Home Win */}
              <button
                onClick={() => handleOutcomeSelect(match.id, 1)}
                className={`p-4 rounded-lg transition-colors ${
                  selectedOutcome[match.id] === 1 ? 'bg-indigo-600' : 'bg-navy-700 hover:bg-navy-600'
                }`}
              >
                <div className="text-gray-400 mb-1">{match.homeTeam}</div>
                <div className="text-white text-2xl font-bold">{match.odds.home}</div>
              </button>

              {/* Draw */}
              <button
                onClick={() => handleOutcomeSelect(match.id, 0)}
                className={`p-4 rounded-lg transition-colors ${
                  selectedOutcome[match.id] === 0 ? 'bg-indigo-600' : 'bg-navy-700 hover:bg-navy-600'
                }`}
              >
                <div className="text-gray-400 mb-1">Draw</div>
                <div className="text-white text-2xl font-bold">{match.odds.draw}</div>
              </button>

              {/* Away Win */}
              <button
                onClick={() => handleOutcomeSelect(match.id, 2)}
                className={`p-4 rounded-lg transition-colors ${
                  selectedOutcome[match.id] === 2 ? 'bg-indigo-600' : 'bg-navy-700 hover:bg-navy-600'
                }`}
              >
                <div className="text-gray-400 mb-1">{match.awayTeam}</div>
                <div className="text-white text-2xl font-bold">{match.odds.away}</div>
              </button>
            </div>

            {/* Bet Input */}
            <div className="flex space-x-4 mb-6">
              <input
                type="text"
                value={betAmount[match.id] || ''}
                onChange={(e) => handleBetAmountChange(match.id, e.target.value)}
                placeholder="Enter bet amount in ETN"
                className="flex-1 bg-navy-900 text-white px-4 py-2 rounded-lg"
              />
              <button
                onClick={() => handleBet(match.id)}
                disabled={isLoading[match.id] || isConnecting}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isLoading[match.id] || isConnecting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading[match.id] ? 'Placing Bet...' : isConnecting ? 'Connecting...' : 'Place Bet'}
              </button>
            </div>

            {/* Comments Section */}
            <div className="border-t border-navy-700 pt-4 mt-6">
              <button
                onClick={() => toggleComments(match.id)}
                className="w-full flex items-center justify-between text-white font-medium mb-4 hover:text-indigo-400 transition-colors"
              >
                <span>Comments {match.comments?.length ? `(${match.comments.length})` : ''}</span>
                {expandedComments[match.id] ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
              
              {expandedComments[match.id] && (
                <div className="space-y-4">
                  <div className="text-gray-400 text-sm">No comments yet. Be the first to comment!</div>
                  
                  {/* Comment Input */}
                  {isConnected ? (
                    <div className="flex space-x-3 mt-4">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 bg-navy-900 text-white px-4 py-2 rounded-lg border border-navy-700 focus:border-indigo-500 focus:outline-none"
                      />
                      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        Post
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-navy-900 rounded-lg border border-navy-700">
                      <p className="text-gray-400 text-sm text-center">
                        Connect your wallet to join the conversation
                      </p>
                      <button
                        onClick={connectWallet}
                        className="mt-2 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChampionsLeague;
