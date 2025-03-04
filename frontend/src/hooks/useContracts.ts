import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getBettingPoolContract, getSpecificBetContract, getCommentHubContract, getSigner } from '../contracts';

export const useWallet = () => {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || '');
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return { account, balance, connectWallet, isConnecting };
};

export const useSpecificBet = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const contract = getSpecificBetContract();
      const count = await contract.predictionCount();
      
      const predictionPromises = [];
      for (let i = 1; i <= count.toNumber(); i++) {
        predictionPromises.push(contract.getPrediction(i));
      }
      
      const results = await Promise.all(predictionPromises);
      setPredictions(results);
    } catch (err) {
      console.error('Error loading predictions:', err);
      setError('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  const placeBet = async (predictionId: number, prediction: boolean, amount: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getSpecificBetContract(signer);
      
      const tx = await contract.placeBet(predictionId, prediction, {
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      
      await loadPredictions();
    } catch (err) {
      console.error('Error placing bet:', err);
      setError('Failed to place bet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  return { predictions, loading, error, placeBet, loadPredictions };
};

export const useComments = (predictionId: number) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const contract = getCommentHubContract();
      const count = await contract.commentCounts(predictionId);
      
      const commentPromises = [];
      for (let i = 0; i < count.toNumber(); i++) {
        commentPromises.push(contract.gameComments(predictionId, i));
      }
      
      const results = await Promise.all(commentPromises);
      setComments(results);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [predictionId]);

  const addComment = async (content: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getCommentHubContract(signer);
      
      const tx = await contract.addComment(predictionId, content);
      await tx.wait();
      
      await loadComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return { comments, loading, error, addComment, loadComments };
};
