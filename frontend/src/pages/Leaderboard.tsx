import { useState } from 'react';

const mockLeaderboard = [
  { rank: 1, address: '0x1234...5678', winRate: 75.5, totalBets: 120, totalWinnings: 15000 },
  { rank: 2, address: '0x8765...4321', winRate: 70.2, totalBets: 95, totalWinnings: 12000 },
  { rank: 3, address: '0x9876...1234', winRate: 68.8, totalBets: 150, totalWinnings: 10000 },
];

function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');

  const timeframes = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Leaderboard</h1>

      {/* Timeframe Filter */}
      <div className="flex space-x-4 mb-8">
        {timeframes.map(tf => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id as typeof timeframe)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              timeframe === tf.id ? 'bg-indigo-600 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-navy-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-700">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Address</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Win Rate</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Total Bets</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Total Winnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {mockLeaderboard.map((player) => (
              <tr key={player.address} className="hover:bg-navy-700">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`
                      text-lg font-bold
                      ${player.rank === 1 ? 'text-yellow-400' : ''}
                      ${player.rank === 2 ? 'text-gray-400' : ''}
                      ${player.rank === 3 ? 'text-amber-700' : ''}
                      ${player.rank > 3 ? 'text-white' : ''}
                    `}>
                      {player.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">{player.address}</td>
                <td className="px-6 py-4 text-white">{player.winRate}%</td>
                <td className="px-6 py-4 text-white">{player.totalBets}</td>
                <td className="px-6 py-4 text-white">{player.totalWinnings} ETN</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;
