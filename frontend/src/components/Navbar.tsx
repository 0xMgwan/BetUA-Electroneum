import { Link } from 'react-router-dom';
import { useContract } from '../hooks/useContract';

export default function Navbar() {
  const { signer, connectWallet, address, isConnecting } = useContract();

  const shortenAddress = (addr: string) => {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <div className="bg-navy-900 border-b border-navy-700">
      <nav className="container mx-auto px-6">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mr-12">
              PlayIt
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white font-medium flex items-center"
            >
              <span className="mr-2">🎮</span>
              Matches
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-gray-300 hover:text-white font-medium flex items-center"
            >
              <span className="mr-2">🏆</span>
              Leaderboard
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-gray-300 hover:text-white font-medium flex items-center"
            >
              <span className="mr-2">📖</span>
              How It Works
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center ml-auto">
            {signer ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-white font-medium flex items-center"
                >
                  <span className="mr-2">👤</span>
                  Profile
                </Link>
                <div className="text-white font-medium bg-navy-800 px-4 py-2 rounded-lg">
                  {shortenAddress(address || '')}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
