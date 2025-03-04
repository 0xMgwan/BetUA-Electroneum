// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Context.sol
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// Ownable.sol
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// CommentHub.sol
contract CommentHub is Ownable {
    struct Comment {
        uint256 id;
        uint256 gameId;
        address author;
        string content;
        uint256 timestamp;
        uint256 tips;
    }

    mapping(uint256 => Comment[]) public gameComments;
    mapping(uint256 => uint256) public commentCounts;
    uint256 public totalComments;

    // Maximum comment length to prevent excessive gas costs
    uint256 public constant MAX_COMMENT_LENGTH = 280; // Twitter-style length

    event CommentAdded(uint256 indexed gameId, uint256 indexed commentId, address indexed author, string content);
    event CommentTipped(uint256 indexed gameId, uint256 indexed commentId, address indexed tipper, uint256 amount);

    constructor() {}

    function addComment(uint256 gameId, string memory content) external {
        require(bytes(content).length > 0 && bytes(content).length <= MAX_COMMENT_LENGTH, "Invalid comment length");
        
        uint256 commentId = totalComments++;
        Comment memory newComment = Comment({
            id: commentId,
            gameId: gameId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            tips: 0
        });

        gameComments[gameId].push(newComment);
        commentCounts[gameId]++;

        emit CommentAdded(gameId, commentId, msg.sender, content);
    }

    function tipComment(uint256 gameId, uint256 commentId) external payable {
        require(msg.value > 0, "Tip amount must be positive");
        require(commentId < commentCounts[gameId], "Comment does not exist");

        Comment storage comment = gameComments[gameId][commentId];
        comment.tips += msg.value;
        
        // Transfer tip to comment author
        payable(comment.author).transfer(msg.value);

        emit CommentTipped(gameId, commentId, msg.sender, msg.value);
    }

    function getGameComments(uint256 gameId) external view returns (Comment[] memory) {
        return gameComments[gameId];
    }

    function getComment(uint256 gameId, uint256 commentId) external view returns (Comment memory) {
        require(commentId < commentCounts[gameId], "Comment does not exist");
        return gameComments[gameId][commentId];
    }

    function getCommentCount(uint256 gameId) external view returns (uint256) {
        return commentCounts[gameId];
    }
}
