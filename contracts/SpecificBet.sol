// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SpecificBet is Ownable, ReentrancyGuard {
    struct Prediction {
        uint256 id;
        uint256 gameId;
        string description;
        uint256 deadline;
        bool isResolved;
        bool outcome;
        uint256 totalStake;
        uint256 odds;
    }

    struct UserBet {
        address bettor;
        uint256 amount;
        bool predicted;
    }

    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => UserBet[]) public bets;
    mapping(address => mapping(uint256 => bool)) public hasBet;

    uint256 public constant MIN_BET = 1 ether; // 1 ETN
    uint256 public predictionCount;

    event PredictionCreated(uint256 indexed predictionId, uint256 indexed gameId, string description, uint256 odds);
    event BetPlaced(uint256 indexed predictionId, address indexed bettor, uint256 amount, bool prediction);
    event PredictionResolved(uint256 indexed predictionId, bool outcome);
    event WinningsPaid(uint256 indexed predictionId, address indexed winner, uint256 amount);

    constructor() {}

    function createPrediction(
        uint256 gameId,
        string memory description,
        uint256 deadline,
        uint256 odds
    ) external onlyOwner {
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(odds > 0, "Odds must be positive");
        
        predictionCount++;
        predictions[predictionCount] = Prediction({
            id: predictionCount,
            gameId: gameId,
            description: description,
            deadline: deadline,
            isResolved: false,
            outcome: false,
            totalStake: 0,
            odds: odds
        });

        emit PredictionCreated(predictionCount, gameId, description, odds);
    }

    function placeBet(uint256 predictionId, bool prediction) external payable nonReentrant {
        require(msg.value >= MIN_BET, "Bet amount too low");
        Prediction storage pred = predictions[predictionId];
        require(!pred.isResolved, "Prediction already resolved");
        require(block.timestamp < pred.deadline, "Deadline passed");
        require(!hasBet[msg.sender][predictionId], "Already bet on this prediction");

        pred.totalStake += msg.value;

        bets[predictionId].push(UserBet({
            bettor: msg.sender,
            amount: msg.value,
            predicted: prediction
        }));

        hasBet[msg.sender][predictionId] = true;

        emit BetPlaced(predictionId, msg.sender, msg.value, prediction);
    }

    function resolvePrediction(uint256 predictionId, bool outcome) external onlyOwner {
        Prediction storage pred = predictions[predictionId];
        require(!pred.isResolved, "Prediction already resolved");
        require(block.timestamp >= pred.deadline, "Cannot resolve before deadline");

        pred.isResolved = true;
        pred.outcome = outcome;

        for (uint i = 0; i < bets[predictionId].length; i++) {
            UserBet memory bet = bets[predictionId][i];
            if (bet.predicted == outcome) {
                uint256 winnings = (bet.amount * pred.odds) / 100;
                payable(bet.bettor).transfer(winnings);
                emit WinningsPaid(predictionId, bet.bettor, winnings);
            }
        }

        emit PredictionResolved(predictionId, outcome);
    }

    function getPrediction(uint256 predictionId) external view returns (Prediction memory) {
        return predictions[predictionId];
    }

    function getBets(uint256 predictionId) external view returns (UserBet[] memory) {
        return bets[predictionId];
    }
}
