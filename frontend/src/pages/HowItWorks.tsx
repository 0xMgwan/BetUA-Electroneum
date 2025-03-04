function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">How It Works</h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-navy-800 p-6 rounded-lg">
          <div className="text-2xl font-bold text-indigo-400 mb-4">1. Connect Wallet</div>
          <p className="text-gray-300">
            Connect your Ethereum wallet to start betting. We support MetaMask and other popular wallets.
          </p>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <div className="text-2xl font-bold text-indigo-400 mb-4">2. Choose Match</div>
          <p className="text-gray-300">
            Browse matches across different leagues. Select your preferred match and outcome.
          </p>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <div className="text-2xl font-bold text-indigo-400 mb-4">3. Place Bet</div>
          <p className="text-gray-300">
            Enter your bet amount in ETN and confirm the transaction through your wallet.
          </p>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <div className="text-2xl font-bold text-indigo-400 mb-4">4. Smart Contracts</div>
          <p className="text-gray-300">
            All bets are handled by secure smart contracts on the Ethereum network. Results are verified by Chainlink oracles.
          </p>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <div className="text-2xl font-bold text-indigo-400 mb-4">5. Winning</div>
          <p className="text-gray-300">
            If your prediction is correct, winnings are automatically sent to your wallet after the match ends.
          </p>
        </div>

        <div className="bg-navy-800 p-6 rounded-lg">
          <div className="text-2xl font-bold text-indigo-400 mb-4">6. Leaderboard</div>
          <p className="text-gray-300">
            Compete with other bettors! Top performers are featured on our leaderboard with special rewards.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
