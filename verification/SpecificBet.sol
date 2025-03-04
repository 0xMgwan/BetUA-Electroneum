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


// File contracts/SpecificBet.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.19;


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
