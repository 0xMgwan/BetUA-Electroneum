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
    event ResultDisputed(uint256 indexed gameId, address indexed disputer);
    
    modifier onlyOracle() {
        require(oracles[msg.sender].isActive, "Not an active oracle");
        _;
    }
    
    constructor() payable {
        require(msg.value >= MIN_ORACLE_STAKE, "Insufficient oracle stake");
        
        // Add contract deployer as first oracle
        oracles[msg.sender] = Oracle({
            isActive: true,
            dataSource: "Manual",
            stake: msg.value,
            lastUpdate: block.timestamp
        });
        
        emit OracleAdded(msg.sender, "Manual");
    }
    
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
        require(oracles[_oracle].isActive, "Oracle not active");
        uint256 stake = oracles[_oracle].stake;
        
        delete oracles[_oracle];
        payable(_oracle).transfer(stake);
        
        emit OracleRemoved(_oracle);
    }
    
    function createGame(
        uint256 gameId,
        string memory homeTeam,
        string memory awayTeam,
        string memory league,
        string memory season,
        string memory matchDay,
        uint256 startTime
    ) external onlyOracle whenNotPaused {
        require(games[gameId].id == 0, "Game already exists");
        require(startTime > block.timestamp, "Invalid start time");
        
        games[gameId] = Game({
            id: gameId,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            league: league,
            season: season,
            matchDay: matchDay,
            startTime: startTime,
            status: GameStatus.PENDING,
            totalBets: 0,
            pools: new uint256[](3),
            result: GameResult(0, 0, 0, 0, 0, ""),
            finalizedAt: 0
        });
        
        emit GameCreated(gameId, homeTeam, awayTeam, league, season, matchDay, startTime);
    }
    
    function proposeResult(
        uint256 gameId, 
        uint8 result,
        uint256 homeScore,
        uint256 awayScore
    ) external onlyOracle whenNotPaused {
        Game storage game = games[gameId];
        require(game.id != 0, "Game does not exist");
        require(game.status != GameStatus.FINISHED, "Game already finished");
        require(block.timestamp >= game.startTime, "Game not started");
        require(result > 0 && result <= 3, "Invalid result");
        
        // Update oracle's last update time
        oracles[msg.sender].lastUpdate = block.timestamp;
        emit OracleUpdated(msg.sender, block.timestamp);
        
        GameResult storage gameResult = game.result;
        
        // If this is the first proposal
        if (gameResult.submittedAt == 0) {
            gameResult.submittedAt = block.timestamp;
            gameResult.result = result;
            gameResult.homeScore = homeScore;
            gameResult.awayScore = awayScore;
            gameResult.confirmations = 1;
            gameResult.dataSource = oracles[msg.sender].dataSource;
            oracleVotes[gameId][msg.sender] = true;
            
            emit ResultProposed(
                gameId, 
                result, 
                homeScore,
                awayScore,
                msg.sender,
                oracles[msg.sender].dataSource
            );
        }
        // If confirming an existing proposal
        else {
            require(!oracleVotes[gameId][msg.sender], "Already voted");
            require(result == gameResult.result, "Result mismatch");
            require(homeScore == gameResult.homeScore, "Home score mismatch");
            require(awayScore == gameResult.awayScore, "Away score mismatch");
            require(block.timestamp <= gameResult.submittedAt + RESULT_TIMELOCK, "Timelock expired");
            
            gameResult.confirmations++;
            oracleVotes[gameId][msg.sender] = true;
            
            emit ResultConfirmed(gameId, msg.sender);
            
            // If we have enough confirmations and timelock passed
            if (gameResult.confirmations >= MIN_CONFIRMATIONS && 
                block.timestamp >= gameResult.submittedAt + RESULT_TIMELOCK) {
                finalizeResult(gameId);
            }
        }
    }
    
    // Internal function to finalize result
    function finalizeResult(uint256 gameId) internal {
        Game storage game = games[gameId];
        GameResult storage gameResult = game.result;
        
        game.status = GameStatus.FINISHED;
        game.finalizedAt = block.timestamp;
        
        emit ResultFinalized(
            gameId,
            gameResult.result,
            gameResult.homeScore,
            gameResult.awayScore,
            gameResult.dataSource
        );
    }
    
    function placeBet(uint256 gameId, uint8 outcome) external payable 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value >= minBetAmount, "Bet amount too low");
        require(outcome > 0 && outcome <= 3, "Invalid outcome");
        
        Game storage game = games[gameId];
        require(game.id != 0, "Game does not exist");
        require(game.status == GameStatus.PENDING, "Game not accepting bets");
        require(block.timestamp < game.startTime, "Game already started");
        
        game.pools[outcome - 1] += msg.value;
        game.totalBets += msg.value;
        bets[gameId][outcome - 1][msg.sender] += msg.value;
        
        emit BetPlaced(gameId, msg.sender, outcome, msg.value);
    }
    
    function claimWinnings(uint256 gameId) external 
        nonReentrant 
        whenNotPaused 
    {
        Game storage game = games[gameId];
        require(game.id != 0, "Game does not exist");
        require(game.status == GameStatus.FINISHED, "Game not finished");
        require(!hasClaimed[msg.sender][gameId], "Already claimed");
        
        uint256 betAmount = bets[gameId][game.result.result - 1][msg.sender];
        require(betAmount > 0, "No winning bet");
        
        uint256 winnings = (betAmount * game.totalBets) / game.pools[game.result.result - 1];
        hasClaimed[msg.sender][gameId] = true;
        
        payable(msg.sender).transfer(winnings);
        emit WinningsClaimed(gameId, msg.sender, winnings);
    }
    
    function disputeResult(uint256 gameId) external payable whenNotPaused {
        Game storage game = games[gameId];
        GameResult storage gameResult = game.result;
        
        require(game.id != 0, "Game does not exist");
        require(game.status != GameStatus.FINISHED, "Game already finished");
        require(gameResult.submittedAt > 0, "No result proposed");
        require(block.timestamp <= gameResult.submittedAt + DISPUTE_PERIOD, "Dispute period ended");
        require(msg.value >= MIN_ORACLE_STAKE, "Insufficient dispute stake");
        
        // TODO: Implement dispute logic
        emit ResultDisputed(gameId, msg.sender);
    }
    
    function resolveDispute(uint256 gameId, bool slashOracles) external onlyOwner whenNotPaused {
        Game storage game = games[gameId];
        GameResult storage gameResult = game.result;
        
        require(game.id != 0, "Game does not exist");
        require(gameResult.submittedAt > 0, "No result proposed");
        
        if (slashOracles) {
            // Slash oracles who proposed/confirmed wrong result
            for (address oracle = address(0); oracle != address(0); ) {
                if (oracleVotes[gameId][oracle]) {
                    oracles[oracle].stake -= 10 ether; // Amount slashed for wrong results
                    emit OracleSlashed(oracle, 10 ether);
                }
            }
            // Reset result
            delete game.result;
        } else {
            // If dispute was invalid, finalize the result
            finalizeResult(gameId);
        }
    }
    
    // Emergency Functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Receive function to accept ETN
    receive() external payable {}
}
