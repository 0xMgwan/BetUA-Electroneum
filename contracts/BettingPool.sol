// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract BettingPool is Ownable, ReentrancyGuard, Pausable {
    
    // Oracle Management
    struct Oracle {
        bool isActive;
        string dataSource;    // e.g., "API-Football", "SportsData.io"
        uint256 stake;        // Amount of ETN staked
        uint256 lastUpdate;   // Last time this oracle updated
    }
    
    struct GameResult {
        uint8 result;           // 0: PENDING, 1: HOME_WIN, 2: AWAY_WIN, 3: DRAW
        uint256 homeScore;      // Home team score
        uint256 awayScore;      // Away team score
        uint256 submittedAt;    // When the result was first submitted
        uint256 confirmations;  // Number of oracles that confirmed
        string dataSource;      // Source of the result data
    }
    
    struct Game {
        uint256 id;
        string homeTeam;
        string awayTeam;
        uint256 startTime;
        string league;           // e.g., "Premier League", "La Liga"
        string season;           // e.g., "2024/2025"
        string matchDay;         // e.g., "Round 28"
        GameStatus status;
        uint256 totalBets;
        uint256[] pools;        // [homeWin, awayWin, draw]
        GameResult result;
        uint256 finalizedAt;
    }

    struct Comment {
        address author;
        string content;
        uint256 timestamp;
    }
    
    struct UserStats {
        uint256 totalBets;
        uint256 totalWins;
        uint256 totalAmount;
        uint256[] betGameIds;
    }
    
    // Constants
    uint256 public constant MIN_ORACLE_STAKE = 100 ether;  // 100 ETN
    uint256 public constant RESULT_TIMELOCK = 1 hours;     // Reduced for football matches
    uint256 public constant DISPUTE_PERIOD = 12 hours;     // Reduced for faster payouts
    uint256 public constant MIN_CONFIRMATIONS = 2;         // Need 2 oracles to confirm
    uint256 public minBetAmount = 1 ether;                 // 1 ETN
    
    enum GameStatus { PENDING, ACTIVE, FINISHED, CANCELLED }
    
    // Mappings
    mapping(address => Oracle) public oracles;
    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => bool)) public oracleVotes;
    mapping(uint256 => mapping(uint8 => mapping(address => uint256))) public bets;
    mapping(address => mapping(uint256 => bool)) public hasClaimed;
    mapping(uint256 => Comment[]) public gameComments;
    mapping(address => UserStats) public userStats;
    
    // Events
    event OracleAdded(address indexed oracle, string dataSource);
    event OracleUpdated(address indexed oracle, uint256 timestamp);
    event GameCreated(
        uint256 indexed gameId, 
        string homeTeam, 
        string awayTeam, 
        string league,
        string season,
        string matchDay,
        uint256 startTime
    );
    event ResultProposed(
        uint256 indexed gameId, 
        uint8 result, 
        uint256 homeScore,
        uint256 awayScore,
        address indexed oracle,
        string dataSource
    );
    event ResultConfirmed(uint256 indexed gameId, address indexed oracle);
    event ResultFinalized(
        uint256 indexed gameId, 
        uint8 result,
        uint256 homeScore,
        uint256 awayScore,
        string dataSource
    );
    event BetPlaced(uint256 indexed gameId, address indexed bettor, uint8 outcome, uint256 amount);
    event WinningsClaimed(uint256 indexed gameId, address indexed bettor, uint256 amount);
    event OracleRemoved(address indexed oracle);
    event OracleSlashed(address indexed oracle, uint256 amount);
    event CommentAdded(uint256 indexed gameId, address indexed author, string content);
    
    constructor() payable {
        require(msg.value >= MIN_ORACLE_STAKE, "Initial stake required");
    }
    
    // Game Management
    function createGame(
        uint256 gameId,
        string memory homeTeam,
        string memory awayTeam,
        string memory league,
        string memory season,
        string memory matchDay,
        uint256 startTime
    ) external {
        require(oracles[msg.sender].isActive, "Not an active oracle");
        require(games[gameId].id == 0, "Game already exists");
        require(startTime > block.timestamp, "Invalid start time");
        
        games[gameId] = Game({
            id: gameId,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            startTime: startTime,
            league: league,
            season: season,
            matchDay: matchDay,
            status: GameStatus.ACTIVE,
            totalBets: 0,
            pools: new uint256[](3),
            result: GameResult(0, 0, 0, 0, 0, ""),
            finalizedAt: 0
        });
        
        emit GameCreated(gameId, homeTeam, awayTeam, league, season, matchDay, startTime);
    }
    
    function placeBet(uint256 gameId, uint8 outcome) external payable whenNotPaused {
        require(msg.value >= minBetAmount, "Bet amount too low");
        require(outcome > 0 && outcome <= 3, "Invalid outcome");
        
        Game storage game = games[gameId];
        require(game.id != 0, "Game not found");
        require(game.status == GameStatus.ACTIVE, "Game not active");
        require(block.timestamp < game.startTime, "Game already started");
        
        // Update user stats
        UserStats storage stats = userStats[msg.sender];
        if (stats.totalBets == 0) {
            stats.betGameIds = new uint256[](0);
        }
        stats.totalBets++;
        stats.totalAmount += msg.value;
        stats.betGameIds.push(gameId);
        
        // Update game pools
        bets[gameId][outcome][msg.sender] += msg.value;
        game.pools[outcome - 1] += msg.value;
        game.totalBets += msg.value;
        
        emit BetPlaced(gameId, msg.sender, outcome, msg.value);
    }
    
    function proposeResult(
        uint256 gameId,
        uint8 result,
        uint256 homeScore,
        uint256 awayScore
    ) external {
        require(oracles[msg.sender].isActive, "Not an active oracle");
        require(result > 0 && result <= 3, "Invalid result");
        
        Game storage game = games[gameId];
        require(game.id != 0, "Game not found");
        require(game.status == GameStatus.ACTIVE, "Game not active");
        require(block.timestamp >= game.startTime, "Game not started");
        
        if (game.result.submittedAt == 0) {
            // First result proposal
            game.result = GameResult(
                result,
                homeScore,
                awayScore,
                block.timestamp,
                1,
                oracles[msg.sender].dataSource
            );
        } else {
            // Additional confirmation
            require(!oracleVotes[gameId][msg.sender], "Already voted");
            require(
                game.result.result == result &&
                game.result.homeScore == homeScore &&
                game.result.awayScore == awayScore,
                "Result mismatch"
            );
            game.result.confirmations++;
        }
        
        oracleVotes[gameId][msg.sender] = true;
        oracles[msg.sender].lastUpdate = block.timestamp;
        
        emit ResultConfirmed(gameId, msg.sender);
        
        // Check if we have enough confirmations
        if (game.result.confirmations >= MIN_CONFIRMATIONS &&
            block.timestamp >= game.result.submittedAt + RESULT_TIMELOCK) {
            game.status = GameStatus.FINISHED;
            game.finalizedAt = block.timestamp;
            
            emit ResultFinalized(
                gameId,
                game.result.result,
                game.result.homeScore,
                game.result.awayScore,
                game.result.dataSource
            );
        }
    }
    
    function claimWinnings(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.status == GameStatus.FINISHED, "Game not finished");
        require(!hasClaimed[msg.sender][gameId], "Already claimed");
        
        uint256 betAmount = bets[gameId][game.result.result][msg.sender];
        require(betAmount > 0, "No winning bet");
        
        // Calculate winnings
        uint256 totalPool = game.totalBets;
        uint256 winningPool = game.pools[game.result.result - 1];
        uint256 winnings = (betAmount * totalPool) / winningPool;
        
        // Update user stats
        userStats[msg.sender].totalWins++;
        hasClaimed[msg.sender][gameId] = true;
        
        // Transfer winnings
        (bool sent, ) = msg.sender.call{value: winnings}("");
        require(sent, "Failed to send winnings");
        
        emit WinningsClaimed(gameId, msg.sender, winnings);
    }
    
    // Oracle Management
    function addOracle(address _oracle, string memory _dataSource) external payable onlyOwner {
        require(!oracles[_oracle].isActive, "Oracle already exists");
        require(msg.value >= MIN_ORACLE_STAKE, "Insufficient stake");
        
        oracles[_oracle] = Oracle({
            isActive: true,
            dataSource: _dataSource,
            stake: msg.value,
            lastUpdate: block.timestamp
        });
        
        emit OracleAdded(_oracle, _dataSource);
    }
    
    function removeOracle(address _oracle) external onlyOwner {
        require(oracles[_oracle].isActive, "Oracle not found");
        
        uint256 stake = oracles[_oracle].stake;
        delete oracles[_oracle];
        
        (bool sent, ) = _oracle.call{value: stake}("");
        require(sent, "Failed to return stake");
        
        emit OracleRemoved(_oracle);
    }
    
    function slashOracle(address _oracle) external onlyOwner {
        require(oracles[_oracle].isActive, "Oracle not found");
        
        uint256 stake = oracles[_oracle].stake;
        delete oracles[_oracle];
        
        emit OracleSlashed(_oracle, stake);
    }
    
    // View Functions
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    function getGameComments(uint256 gameId) external view returns (Comment[] memory) {
        return gameComments[gameId];
    }
    
    function getComment(uint256 gameId, uint256 index) external view returns (Comment memory) {
        require(index < gameComments[gameId].length, "Comment index out of bounds");
        return gameComments[gameId][index];
    }
    
    function getGameStatus(uint256 gameId) external view returns (uint8) {
        return uint8(games[gameId].status);
    }
    
    function getGameResult(uint256 gameId) external view returns (uint8) {
        return games[gameId].result.result;
    }
    
    function getGameHomeScore(uint256 gameId) external view returns (uint256) {
        return games[gameId].result.homeScore;
    }
    
    function getGameAwayScore(uint256 gameId) external view returns (uint256) {
        return games[gameId].result.awayScore;
    }
    
    function getGameStartTime(uint256 gameId) external view returns (uint256) {
        return games[gameId].startTime;
    }
    
    // Admin Functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setMinBetAmount(uint256 _amount) external onlyOwner {
        minBetAmount = _amount;
    }
    
    // Fallback and Receive
    receive() external payable {}
    fallback() external payable {}
}
