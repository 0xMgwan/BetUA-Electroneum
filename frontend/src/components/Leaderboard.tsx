import { mockLeaderboard } from './MockData';
import { ethers } from 'ethers';

export default function Leaderboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">🏆 Top Traders</h1>
          <div className="flex space-x-4">
            <button className="px-4 py-2 rounded bg-indigo-600 text-white">
              All Time
            </button>
            <button className="px-4 py-2 rounded bg-navy-800 text-white">
              Monthly
            </button>
            <button className="px-4 py-2 rounded bg-navy-800 text-white">
              Weekly
            </button>
          </div>
        </div>

        <div className="bg-navy-800 rounded-lg overflow-hidden shadow-lg">
          <div className="p-6">
            <div className="space-y-4">
              {mockLeaderboard.map((trader, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 ${
                    index < 3 ? 'bg-navy-700' : 'bg-navy-800'
                  } rounded-lg border border-navy-700`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-700' : 'bg-navy-600'}
                      text-white font-bold
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{trader.address}</div>
                      <div className="text-gray-400 text-sm">
                        {trader.totalTrades} trades • Win Rate: {(trader.winRate * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      {ethers.utils.formatEther(trader.earnings)} ETN
                    </div>
                    <div className="text-green-400 text-sm">
                      +{(trader.weeklyGrowth * 100).toFixed(1)}% this week
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
