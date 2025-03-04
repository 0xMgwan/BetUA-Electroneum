const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BettingPool", function () {
  let BettingPool;
  let bettingPool;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    BettingPool = await ethers.getContractFactory("BettingPool");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    bettingPool = await BettingPool.deploy();
    await bettingPool.deployed();
  });

  describe("Game Creation", function () {
    it("Should create a new game", async function () {
      const homeTeam = "PSG";
      const awayTeam = "Man City";
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      await expect(bettingPool.createGame(homeTeam, awayTeam, startTime))
        .to.emit(bettingPool, "GameCreated")
        .withArgs(1, homeTeam, awayTeam, startTime);

      const game = await bettingPool.games(1);
      expect(game.homeTeam).to.equal(homeTeam);
      expect(game.awayTeam).to.equal(awayTeam);
      expect(game.startTime).to.equal(startTime);
      expect(game.isFinished).to.equal(false);
    });

    it("Should not create a game with past start time", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      await expect(
        bettingPool.createGame("PSG", "Man City", pastTime)
      ).to.be.revertedWith("Game must start in the future");
    });
  });

  describe("Betting", function () {
    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      await bettingPool.createGame("PSG", "Man City", startTime);
    });

    it("Should allow placing a bet", async function () {
      const betAmount = ethers.utils.parseEther("1");
      await expect(bettingPool.connect(addr1).placeBet(1, 0, { value: betAmount }))
        .to.emit(bettingPool, "BetPlaced")
        .withArgs(1, addr1.address, betAmount, 0);

      const game = await bettingPool.games(1);
      expect(game.totalHomePool).to.equal(betAmount);
    });

    it("Should not allow betting below minimum amount", async function () {
      const lowAmount = ethers.utils.parseEther("0.5");
      await expect(
        bettingPool.connect(addr1).placeBet(1, 0, { value: lowAmount })
      ).to.be.revertedWith("Bet amount too low");
    });

    it("Should not allow betting on finished games", async function () {
      await bettingPool.finishGame(1, 2, 1); // Home team wins
      const betAmount = ethers.utils.parseEther("1");
      await expect(
        bettingPool.connect(addr1).placeBet(1, 0, { value: betAmount })
      ).to.be.revertedWith("Game already finished");
    });
  });

  describe("Game Resolution", function () {
    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      await bettingPool.createGame("PSG", "Man City", startTime);
      
      // Place bets
      const betAmount = ethers.utils.parseEther("1");
      await bettingPool.connect(addr1).placeBet(1, 0, { value: betAmount }); // Home win
      await bettingPool.connect(addr2).placeBet(1, 1, { value: betAmount }); // Draw
    });

    it("Should distribute winnings correctly", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await addr1.getBalance();
      
      // Home team wins (2-1)
      await bettingPool.finishGame(1, 2, 1);
      
      // addr1 should receive both bets (minus gas)
      const finalBalance = await addr1.getBalance();
      expect(finalBalance.sub(initialBalance)).to.be.gt(ethers.utils.parseEther("1.9")); // Allowing for gas costs
    });

    it("Should not allow resolving game twice", async function () {
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      
      await bettingPool.finishGame(1, 2, 1);
      await expect(bettingPool.finishGame(1, 2, 1)).to.be.revertedWith("Game already finished");
    });
  });
});
