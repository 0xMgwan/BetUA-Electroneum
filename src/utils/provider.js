import { ethers } from 'ethers';

class BlockchainProvider {
  constructor() {
    this.httpProvider = null;
    this.wsProvider = null;
    this.fallbackProvider = null;
  }

  initialize() {
    // Create HTTP Provider with ANKR RPC
    this.httpProvider = new ethers.JsonRpcProvider(
      process.env.ELECTRONEUM_RPC_URL,
      {
        name: 'electroneum_testnet',
        chainId: 5201420 // Electroneum testnet chain ID
      }
    );

    // Create Fallback Provider for better reliability
    this.fallbackProvider = this.httpProvider;

    return this.fallbackProvider;
  }

  // Get current provider instance
  getProvider() {
    if (!this.fallbackProvider) {
      return this.initialize();
    }
    return this.fallbackProvider;
  }

  // Get signer for transactions
  async getSigner() {
    const provider = this.getProvider();
    if (process.env.PRIVATE_KEY) {
      return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    }
    throw new Error('No private key provided');
  }

  // Helper method to check if connected to Electroneum network
  async checkConnection() {
    try {
      const provider = this.getProvider();
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      return {
        connected: true,
        network: network.name,
        chainId: network.chainId,
        blockNumber
      };
    } catch (error) {
      console.error('Connection check failed:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Get gas price with premium for faster transactions
  async getGasPrice(premium = 10) {
    const provider = this.getProvider();
    const baseGasPrice = await provider.getFeeData();
    // Add premium percentage
    return baseGasPrice.gasPrice.mul(100 + premium).div(100);
  }

  // Get balance with automatic formatting
  async getBalance(address) {
    const provider = this.getProvider();
    const balance = await provider.getBalance(address);
    return {
      wei: balance.toString(),
      eth: ethers.formatEther(balance)
    };
  }

  // Monitor transaction
  async monitorTransaction(txHash, confirmations = 1) {
    const provider = this.getProvider();
    try {
      const tx = await provider.getTransaction(txHash);
      const receipt = await tx.wait(confirmations);
      return {
        success: receipt.status === 1,
        receipt
      };
    } catch (error) {
      console.error('Transaction monitoring failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainProvider = new BlockchainProvider();

// Export provider instance getter
export const getProvider = () => blockchainProvider.getProvider();

// Export signer getter
export const getSigner = () => blockchainProvider.getSigner();
