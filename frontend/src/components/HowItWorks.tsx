import React from 'react';
import { useNavigate } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-white">How PlayIt Works</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-navy-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Connect Your Wallet</h2>
          <p className="text-gray-300 mb-4">
            Link your ETN wallet to start betting. Your funds are always under your control,
            and you can disconnect at any time.
          </p>
          <ul className="list-disc list-inside text-gray-400">
            <li>Secure wallet connection</li>
            <li>No deposit required</li>
            <li>Instant withdrawals</li>
          </ul>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">2. Choose Your Match</h2>
          <p className="text-gray-300 mb-4">
            Browse through live and upcoming matches from various leagues.
            View odds, statistics, and community insights.
          </p>
          <ul className="list-disc list-inside text-gray-400">
            <li>Multiple leagues</li>
            <li>Real-time odds</li>
            <li>Community discussions</li>
          </ul>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">3. Place Your Bet</h2>
          <p className="text-gray-300 mb-4">
            Select your prediction and enter your bet amount. Smart contracts
            ensure transparent and automatic payouts.
          </p>
          <ul className="list-disc list-inside text-gray-400">
            <li>Transparent odds</li>
            <li>Automatic settlements</li>
            <li>Instant payouts</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-navy-800 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">Smart Contract Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">How We Ensure Safety</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Audited smart contracts</li>
              <li>• Decentralized oracle network</li>
              <li>• Transparent betting pools</li>
              <li>• No custodial holdings</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">Benefits</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• No middlemen</li>
              <li>• Lower fees</li>
              <li>• Faster payouts</li>
              <li>• Full transparency</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200"
        >
          Start Betting Now
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;
