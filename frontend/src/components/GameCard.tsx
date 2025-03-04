import React from 'react';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

interface GameCardProps {
  gameId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: number;
  status: number;
  result: number;
  totalBets: string;
  odds: { home: number; draw: number; away: number };
  onPlaceBet: (gameId: string, outcome: number, amount: string) => Promise<void>;
}

const GameCard: React.FC<GameCardProps> = ({
  gameId,
  league,
  homeTeam,
  awayTeam,
  startTime,
  status,
  result,
  totalBets,
  odds,
  onPlaceBet,
}) => {
  const { signer, connectWallet } = useContract();
  const [betAmount, setBetAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [comments, setComments] = React.useState<Comment[]>([]);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Upcoming';
      case 1:
        return 'Live';
      case 2:
        return 'Finished';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'text-yellow-400';
      case 1:
        return 'text-green-400';
      case 2:
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getResultText = (result: number) => {
    switch (result) {
      case 0:
        return 'Not Set';
      case 1:
        return `${homeTeam} Won`;
      case 2:
        return `${awayTeam} Won`;
      case 3:
        return 'Draw';
      default:
        return 'Unknown';
    }
  };

  const handlePlaceBet = async (outcome: number) => {
    if (!signer) {
      return;
    }
    
    try {
      setLoading(true);
      await onPlaceBet(gameId, outcome, ethers.utils.parseEther(betAmount).toString());
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setLoading(false);
      setBetAmount('');
    }
  };

  const handleAddComment = () => {
    if (!signer || !comment.trim()) {
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: '0x1234...5678', // Replace with actual user address
      content: comment,
      timestamp: Date.now(),
    };
    setComments([...comments, newComment]);
    setComment('');
  };

  return (
    <div className="bg-navy-800 rounded-lg shadow-xl p-6 mb-4">
      <div className="text-sm text-blue-400 mb-2">{league}</div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold text-white">{homeTeam} vs {awayTeam}</div>
        <div className={`text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </div>
      </div>

      <div className="text-sm text-gray-400 mb-4">
        {new Date(startTime * 1000).toLocaleString()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Total Bets</p>
          <p className="font-semibold text-white">{ethers.utils.formatEther(totalBets)} ETN</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Result</p>
          <p className="font-semibold text-white">{status === 2 ? getResultText(result) : 'Pending'}</p>
        </div>
      </div>

      {status === 0 && (
        <div className="mt-4">
          {signer ? (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  step="0.1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Bet amount in ETN"
                  className="flex-1 bg-navy-700 border border-navy-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePlaceBet(1)}
                  disabled={loading || !betAmount}
                  className="bg-navy-700 text-white rounded px-4 py-3 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-sm mb-1">Home Win</div>
                  <div className="text-lg font-bold text-green-400">{odds.home}x</div>
                </button>
                <button
                  onClick={() => handlePlaceBet(3)}
                  disabled={loading || !betAmount}
                  className="bg-navy-700 text-white rounded px-4 py-3 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-sm mb-1">Draw</div>
                  <div className="text-lg font-bold text-yellow-400">{odds.draw}x</div>
                </button>
                <button
                  onClick={() => handlePlaceBet(2)}
                  disabled={loading || !betAmount}
                  className="bg-navy-700 text-white rounded px-4 py-3 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-sm mb-1">Away Win</div>
                  <div className="text-lg font-bold text-blue-400">{odds.away}x</div>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition-all duration-200"
            >
              Connect Wallet to Place Bet
            </button>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-navy-700">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-gray-400 hover:text-white"
        >
          {showComments ? 'Hide Comments' : 'Show Comments'} ({comments.length})
        </button>

        {showComments && (
          <div className="mt-4">
            {signer ? (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-navy-700 border border-navy-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Post
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
              >
                Connect Wallet to Comment
              </button>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-navy-700 rounded p-3">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{comment.author}</span>
                    <span>{new Date(comment.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-white">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
