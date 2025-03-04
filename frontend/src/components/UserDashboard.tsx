import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useContracts';
import { ethers } from 'ethers';

interface Transaction {
  hash: string;
  type: 'bet' | 'comment' | 'tip';
  amount?: string;
  timestamp: number;
}

const UserDashboard: React.FC = () => {
  const { account, balance } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!account) return;
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const history = await provider.getHistory(account);
      
      const formattedTransactions = history.map(tx => ({
        hash: tx.hash,
        type: 'bet', // You'd need to determine the type based on the contract interaction
        amount: tx.value ? ethers.utils.formatEther(tx.value) : undefined,
        timestamp: tx.timestamp || Date.now()
      }));
      
      setTransactions(formattedTransactions);
      setLoading(false);
    };
    
    loadTransactions();
  }, [account]);

  if (!account) {
    return (
      <div className="p-4 text-center">
        <p>Please connect your wallet to view your dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Account</h3>
            <p className="text-sm text-gray-600">{account}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Balance</h3>
            <p className="text-2xl font-bold">{balance} ETN</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
        
        <div className="space-y-4">
          {transactions.map(tx => (
            <div key={tx.hash} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                {tx.amount && (
                  <p className="font-medium">
                    {tx.amount} ETN
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Tx: {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
              </p>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
