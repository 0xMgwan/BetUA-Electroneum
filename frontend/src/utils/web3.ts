import { ethers } from 'ethers';
import { BETTING_POOL_ADDRESS, SPECIFIC_BET_ADDRESS, COMMENT_HUB_ADDRESS } from '../contracts';
import BettingPoolABI from '../contracts/BettingPool.json';

const ELECTRONEUM_RPC = import.meta.env.VITE_ELECTRONEUM_RPC_URL;

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

export async function connectWallet(): Promise<ethers.Signer> {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask or another Web3 wallet');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
}

export async function getProvider(): Promise<ethers.providers.Web3Provider> {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error('No web3 provider available');
}

export async function getSigner(): Promise<ethers.Signer> {
  const provider = await getProvider();
  if (provider instanceof ethers.providers.Web3Provider) {
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  }
  throw new Error('No web3 provider available');
}

export function getContract(signerOrProvider: ethers.Signer | ethers.providers.Provider): ethers.Contract {
  return new ethers.Contract(
    BETTING_POOL_ADDRESS,
    BettingPoolABI,
    signerOrProvider
  );
}

export function formatEther(wei: ethers.BigNumber): string {
  return ethers.utils.formatEther(wei);
}

export function parseEther(ether: string): ethers.BigNumber {
  return ethers.utils.parseEther(ether);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
  try {
    ethers.utils.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

export function getGameStatus(status: number): string {
  switch (status) {
    case 0:
      return 'OPEN';
    case 1:
      return 'STARTED';
    case 2:
      return 'FINISHED';
    default:
      return 'UNKNOWN';
  }
}

export function getGameResult(result: number): string {
  switch (result) {
    case 0:
      return 'PENDING';
    case 1:
      return 'HOME_WIN';
    case 2:
      return 'AWAY_WIN';
    case 3:
      return 'DRAW';
    default:
      return 'UNKNOWN';
  }
}
