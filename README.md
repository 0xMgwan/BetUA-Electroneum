# PlayIt - Decentralized Sports Betting Platform

A decentralized sports betting platform built on the Electroneum blockchain where users can bet on real sports matches, engage in discussions, and earn rewards.

## Overview

PlayIt revolutionizes sports betting by providing a transparent, decentralized platform where:
- Users can bet on actual sports matches
- Results are verified through multiple data sources
- Community engagement is encouraged through comments and discussions
- All transactions are transparent and verifiable on the blockchain

## Features

### Core Betting Features
- Place bets on live sports matches
- Three betting options: Home Win, Away Win, Draw
- Automatic winnings distribution
- Real-time odds calculation based on betting pools

### User Features
- Connect with MetaMask wallet
- View personal betting history
- Track wins and earnings
- Claim winnings with one click
- Participate in discussions through comments

### Community Features
- Global leaderboard of top bettors
- Comment system for match discussions
- Like and interact with other users' comments
- Real-time updates of match statuses

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Chakra UI
- **State Management**: React Context
- **Web3 Integration**: ethers.js
- **Styling**: CSS Modules + Chakra UI theming

### Smart Contracts
- **Language**: Solidity ^0.8.19
- **Network**: Electroneum
- **Development Framework**: Hardhat
- **Testing**: Hardhat Test + Chai
- **Contract Features**:
  - BettingPool: Main contract for betting functionality
  - CommentHub: Handles comment system and interactions

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd PlayIt
```

2. Install dependencies:
```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in both root and frontend directories:

Root `.env`:
```bash
ELECTRONEUM_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_api_key
```

Frontend `.env`:
```bash
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_COMMENT_HUB_ADDRESS=your_comment_hub_address
```

4. Start the development server:
```bash
cd frontend
npm run dev
```

## Smart Contract Architecture

### BettingPool Contract
- Handles all betting operations
- Manages game creation and status updates
- Processes bet placement and winnings distribution
- Tracks user statistics and betting history

### CommentHub Contract
- Manages comment creation and storage
- Handles comment interactions (likes)
- Links comments to specific games
- Maintains user engagement metrics

## Deployment

### Smart Contracts
1. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network electroneum
```

2. Verify on Etherscan:
```bash
npx hardhat verify --network electroneum <contract-address>
```

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Contributing

We welcome contributions! Please check out our contributing guidelines for details on how to submit pull requests, report issues, and suggest improvements.

## Security

- All smart contracts are thoroughly tested
- Frontend includes proper error handling
- Wallet connections require explicit user approval
- No sensitive data is stored on-chain

## License

This project is licensed under the MIT License - see the LICENSE file for details.
