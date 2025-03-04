import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import BettingPoolABI from '../abi/BettingPool.json';
import CommentHubABI from '../abi/CommentHub.json';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

interface ContractContextType {
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  commentHub: ethers.Contract | null;
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  addComment: (gameId: number, content: string) => Promise<void>;
}

const ContractContext = createContext<ContractContextType>({
  signer: null,
  contract: null,
  commentHub: null,
  address: null,
  isConnecting: false,
  isConnected: false,
  connectWallet: async () => {},
  disconnect: () => {},
  addComment: async () => {}
});

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const COMMENT_HUB_ADDRESS = import.meta.env.VITE_COMMENT_HUB_ADDRESS;
const RPC_URL = import.meta.env.VITE_ELECTRONEUM_RPC_URL;

export function ContractProvider({ children }: { children: ReactNode }) {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [commentHub, setCommentHub] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const disconnect = () => {
    setSigner(null);
    setContract(null);
    setCommentHub(null);
    setAddress(null);
    setIsConnected(false);
  };

  const addComment = async (gameId: number, content: string) => {
    if (!commentHub || !address) return;
    await commentHub.addComment(gameId, content);
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this app');
      }

      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const wallet = ethers.Wallet.createRandom();
      const connectedWallet = wallet.connect(provider);
      const signer = connectedWallet;
      const address = await signer.getAddress();

      let newContract = null;
      let newCommentHub = null;
      
      if (CONTRACT_ADDRESS) {
        newContract = new ethers.Contract(CONTRACT_ADDRESS, BettingPoolABI.abi, signer);
      }
      if (COMMENT_HUB_ADDRESS) {
        newCommentHub = new ethers.Contract(COMMENT_HUB_ADDRESS, CommentHubABI.abi, signer);
      }

      setProvider(provider);
      setSigner(signer);
      setContract(newContract);
      setCommentHub(newCommentHub);
      setAddress(address);
      setIsConnected(true);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ContractContext.Provider
      value={{
        signer,
        contract,
        commentHub,
        address,
        isConnecting,
        isConnected,
        connectWallet,
        disconnect,
        addComment
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract(): ContractContextType {
  return useContext(ContractContext);
}
