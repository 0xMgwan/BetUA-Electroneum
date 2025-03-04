import { useState } from 'react';
import { mockMatches } from './MockData';

export default function Upcoming() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Filter for upcoming matches (mock data for now)
  const upcomingMatches = mockMatches.filter(match => 
    new Date(match.startTime).getTime() > Date.now()
  ).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upcoming Matches</h1>
        <p className="text-gray-400">Place your bets on upcoming matches across different leagues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingMatches.map((match) => (
          <div 
            key={match.id}
            className="bg-navy-800 rounded-lg p-6 hover:bg-navy-700 transition-colors cursor-pointer"
            onClick={() => setSelectedMatch(match.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-indigo-400 font-medium">{match.league}</span>
              <span className="text-gray-400 text-sm">
                {new Date(match.startTime).toLocaleDateString()} 
                {' '}
                {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img 
                  src={match.team1Logo} 
                  alt={match.team1} 
                  className="w-8 h-8 mr-2"
                />
                <span className="text-white font-medium">{match.team1}</span>
              </div>
              <span className="text-gray-400">vs</span>
              <div className="flex items-center">
                <span className="text-white font-medium">{match.team2}</span>
                <img 
                  src={match.team2Logo} 
                  alt={match.team2} 
                  className="w-8 h-8 ml-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-400">
                <span className="mr-2">Pool Size:</span>
                <span className="text-white">{match.poolSize} ETH</span>
              </div>
              <div className="text-gray-400">
                <span className="mr-2">Odds:</span>
                <span className="text-white">{match.odds}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
