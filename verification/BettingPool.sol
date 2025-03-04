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


// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)


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


contract BettingPool is Ownable, ReentrancyGuard {
    
    address public oracle;
    uint256 public minBetAmount = 1 ether; // 1 ETN
    
    enum GameStatus { PENDING, ACTIVE, FINISHED, CANCELLED }
    enum GameResult { PENDING, HOME_WIN, AWAY_WIN, DRAW }
    
    struct Game {
        uint256 id;
        string homeTeam;
        string awayTeam;
        uint256 startTime;
        GameStatus status;
        GameResult result;
        uint256 totalBets;
        uint256[] pools; // [homeWin, awayWin, draw]
    }
    
    // Game ID => Game
    mapping(uint256 => Game) public games;
    // Game ID => Outcome => Address => Amount
    mapping(uint256 => mapping(uint8 => mapping(address => uint256))) public bets;
    // Address => Game ID => bool
    mapping(address => mapping(uint256 => bool)) public hasClaimed;
    
    event GameCreated(uint256 indexed gameId, string homeTeam, string awayTeam, uint256 startTime);
    event BetPlaced(uint256 indexed gameId, address indexed bettor, uint8 outcome, uint256 amount);
    event GameResultSet(uint256 indexed gameId, GameResult result);
    event WinningsClaimed(uint256 indexed gameId, address indexed bettor, uint256 amount);
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this");
        _;
    }
    
    constructor() {
        oracle = msg.sender; // Initially set deployer as oracle
    }
    
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = _oracle;
    }
    
    function createGame(
        uint256 gameId,
        string memory homeTeam,
        string memory awayTeam,
        uint256 startTime
    ) external onlyOracle {
        require(games[gameId].id == 0, "Game already exists");
        require(startTime > block.timestamp, "Invalid start time");
        
        games[gameId] = Game({
            id: gameId,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            startTime: startTime,
            status: GameStatus.PENDING,
            result: GameResult.PENDING,
            totalBets: 0,
            pools: new uint256[](3)
        });
        
        emit GameCreated(gameId, homeTeam, awayTeam, startTime);
    }
    
    function placeBet(uint256 gameId, uint8 outcome) external payable nonReentrant {
        require(msg.value >= minBetAmount, "Bet amount too low");
        require(outcome <= 2, "Invalid outcome");
        Game storage game = games[gameId];
        require(game.id != 0, "Game does not exist");
        require(game.status == GameStatus.PENDING, "Game not accepting bets");
        require(block.timestamp < game.startTime, "Game already started");
        
        bets[gameId][outcome][msg.sender] += msg.value;
        game.pools[outcome] += msg.value;
        game.totalBets += msg.value;
        
        emit BetPlaced(gameId, msg.sender, outcome, msg.value);
    }
    
    function setGameResult(uint256 gameId, GameResult result) external onlyOracle {
        Game storage game = games[gameId];
        require(game.id != 0, "Game does not exist");
        require(game.status != GameStatus.FINISHED, "Game already finished");
        require(result != GameResult.PENDING, "Invalid result");
        
        game.result = result;
        game.status = GameStatus.FINISHED;
        
        emit GameResultSet(gameId, result);
    }
    
    function claimWinnings(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.status == GameStatus.FINISHED, "Game not finished");
        require(!hasClaimed[msg.sender][gameId], "Already claimed");
        
        uint8 winningOutcome;
        if (game.result == GameResult.HOME_WIN) winningOutcome = 0;
        else if (game.result == GameResult.AWAY_WIN) winningOutcome = 1;
        else if (game.result == GameResult.DRAW) winningOutcome = 2;
        
        uint256 betAmount = bets[gameId][winningOutcome][msg.sender];
        require(betAmount > 0, "No winning bet");
        
        uint256 winningPool = game.pools[winningOutcome];
        uint256 winnings = (betAmount * game.totalBets) / winningPool;
        
        hasClaimed[msg.sender][gameId] = true;
        (bool success, ) = msg.sender.call{value: winnings}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(gameId, msg.sender, winnings);
    }
    
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }
    
    function getBetAmount(uint256 gameId, uint8 outcome, address bettor) external view returns (uint256) {
        return bets[gameId][outcome][bettor];
    }
}
