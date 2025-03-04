const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CommentHub", function () {
  let CommentHub;
  let commentHub;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    CommentHub = await ethers.getContractFactory("CommentHub");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    commentHub = await CommentHub.deploy();
    await commentHub.deployed();
  });

  describe("Comment Creation", function () {
    it("Should add a new comment", async function () {
      const gameId = 1;
      const contentHash = "QmTest123";

      await expect(commentHub.connect(addr1).addComment(gameId, contentHash))
        .to.emit(commentHub, "CommentAdded")
        .withArgs(gameId, 0, addr1.address, contentHash);

      const comment = await commentHub.getComment(gameId, 0);
      expect(comment.author).to.equal(addr1.address);
      expect(comment.contentHash).to.equal(contentHash);
      expect(comment.tips).to.equal(0);
    });

    it("Should not add comment with empty content hash", async function () {
      await expect(
        commentHub.connect(addr1).addComment(1, "")
      ).to.be.revertedWith("Content hash cannot be empty");
    });

    it("Should increment comment count", async function () {
      await commentHub.connect(addr1).addComment(1, "QmTest123");
      await commentHub.connect(addr1).addComment(1, "QmTest456");
      
      expect(await commentHub.getCommentCount(1)).to.equal(2);
    });
  });

  describe("Comment Tipping", function () {
    beforeEach(async function () {
      await commentHub.connect(addr1).addComment(1, "QmTest123");
    });

    it("Should allow tipping a comment", async function () {
      const tipAmount = ethers.utils.parseEther("1");
      const initialBalance = await addr1.getBalance();

      await expect(commentHub.connect(addr2).tipComment(1, 0, { value: tipAmount }))
        .to.emit(commentHub, "CommentTipped")
        .withArgs(1, 0, addr2.address, tipAmount);

      const comment = await commentHub.getComment(1, 0);
      expect(comment.tips).to.equal(tipAmount);

      const finalBalance = await addr1.getBalance();
      expect(finalBalance.sub(initialBalance)).to.equal(tipAmount);
    });

    it("Should not allow tipping with zero amount", async function () {
      await expect(
        commentHub.connect(addr2).tipComment(1, 0, { value: 0 })
      ).to.be.revertedWith("Tip amount must be positive");
    });

    it("Should not allow tipping non-existent comment", async function () {
      const tipAmount = ethers.utils.parseEther("1");
      await expect(
        commentHub.connect(addr2).tipComment(1, 999, { value: tipAmount })
      ).to.be.revertedWith("Comment does not exist");
    });
  });

  describe("Comment Retrieval", function () {
    beforeEach(async function () {
      await commentHub.connect(addr1).addComment(1, "QmTest123");
      await commentHub.connect(addr2).addComment(1, "QmTest456");
      await commentHub.connect(addr1).addComment(2, "QmTest789");
    });

    it("Should get all comments for a game", async function () {
      const comments = await commentHub.getGameComments(1);
      expect(comments.length).to.equal(2);
      expect(comments[0].contentHash).to.equal("QmTest123");
      expect(comments[1].contentHash).to.equal("QmTest456");
    });

    it("Should get specific comment", async function () {
      const comment = await commentHub.getComment(1, 0);
      expect(comment.author).to.equal(addr1.address);
      expect(comment.contentHash).to.equal("QmTest123");
    });

    it("Should get correct comment count per game", async function () {
      expect(await commentHub.getCommentCount(1)).to.equal(2);
      expect(await commentHub.getCommentCount(2)).to.equal(1);
      expect(await commentHub.getCommentCount(3)).to.equal(0);
    });
  });
});
