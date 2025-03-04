import { useState } from 'react';
import { useContract } from '../hooks/useContract';

interface Comment {
  author: string;
  content: string;
  timestamp: number;
  transactionHash?: string;
}

interface CommentSectionProps {
  matchId: number;
}

export default function CommentSection({ matchId }: CommentSectionProps) {
  const { signer, contract, connectWallet, addComment } = useContract();
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!comment.trim()) {
      return;
    }

    if (!signer || !contract) {
      try {
        await connectWallet();
      } catch (error) {
        setErrorMessage('Please connect your wallet to comment');
        return;
      }
    }

    setIsLoading(true);
    try {
      const txHash = await addComment(matchId, comment.trim());
      
      // Clear form and show success message
      setComment('');
      setSuccessMessage(`Comment posted! Transaction: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Comment error:', error);
      if (error.message === 'Transaction rejected by user') {
        setErrorMessage('Transaction cancelled by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setErrorMessage('Insufficient funds for gas');
      } else {
        setErrorMessage('Failed to post comment. Please try again.');
      }
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!signer) {
    return (
      <div className="mt-6">
        <button
          onClick={connectWallet}
          className="px-6 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Connect Wallet to Comment
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex flex-col space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-2 rounded-lg bg-navy-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !comment.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading || !comment.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {isLoading ? 'Confirming Transaction...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-600 bg-opacity-20 text-green-500 rounded-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-600 bg-opacity-20 text-red-500 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {/* Comments will be populated from contract events */}
      </div>
    </div>
  );
}
