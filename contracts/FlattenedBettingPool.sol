// Sources flattened with hardhat v2.22.19 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.4) (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/security/Pausable.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (security/Pausable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}


// File contracts/BettingPool.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.19;



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
