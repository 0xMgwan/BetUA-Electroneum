import { ethers } from 'ethers';
import BettingPoolABI from '../../../artifacts/contracts/BettingPool.sol/BettingPool.json';
import SpecificBetABI from '../../../artifacts/contracts/SpecificBet.sol/SpecificBet.json';
import CommentHubABI from '../../../artifacts/contracts/CommentHub.sol/CommentHub.json';

export const BETTING_POOL_ADDRESS = import.meta.env.VITE_BETTING_POOL_ADDRESS;
export const SPECIFIC_BET_ADDRESS = import.meta.env.VITE_SPECIFIC_BET_ADDRESS;
export const COMMENT_HUB_ADDRESS = import.meta.env.VITE_COMMENT_HUB_ADDRESS;

export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(import.meta.env.VITE_ELECTRONEUM_RPC_URL);
};

export const getSigner = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
};

export const getBettingPoolContract = (signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
  return new ethers.Contract(
    BETTING_POOL_ADDRESS,
    BettingPoolABI.abi,
    signerOrProvider || getProvider()
  );
};

export const getSpecificBetContract = (signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
  return new ethers.Contract(
    SPECIFIC_BET_ADDRESS,
    SpecificBetABI.abi,
    signerOrProvider || getProvider()
  );
};

export const getCommentHubContract = (signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
  return new ethers.Contract(
    COMMENT_HUB_ADDRESS,
    CommentHubABI.abi,
    signerOrProvider || getProvider()
  );
};
