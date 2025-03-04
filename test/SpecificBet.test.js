const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SpecificBet", function () {
  let SpecificBet;
  let specificBet;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    SpecificBet = await ethers.getContractFactory("SpecificBet");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    specificBet = await SpecificBet.deploy();
    await specificBet.deployed();
  });

  describe("Prediction Creation", function () {
    it("Should create a new prediction", async function () {
      const gameId = 1;
      const description = "Mbappé scores first";
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const odds = 250; // 2.5x payout

      await expect(specificBet.createPrediction(gameId, description, deadline, odds))
        .to.emit(specificBet, "PredictionCreated")
        .withArgs(1, gameId, description, odds);

      const prediction = await specificBet.predictions(1);
      expect(prediction.gameId).to.equal(gameId);
      expect(prediction.description).to.equal(description);
      expect(prediction.deadline).to.equal(deadline);
      expect(prediction.odds).to.equal(odds);
      expect(prediction.isResolved).to.equal(false);
    });

    it("Should not create a prediction with past deadline", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      await expect(
        specificBet.createPrediction(1, "Mbappé scores first", pastTime, 250)
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Betting", function () {
    beforeEach(async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await specificBet.createPrediction(1, "Mbappé scores first", deadline, 250);
    });

    it("Should allow placing a bet", async function () {
      const betAmount = ethers.utils.parseEther("1");
      await expect(specificBet.connect(addr1).placeBet(1, true, { value: betAmount }))
        .to.emit(specificBet, "BetPlaced")
        .withArgs(1, addr1.address, betAmount, true);

      const prediction = await specificBet.predictions(1);
      expect(prediction.totalStake).to.equal(betAmount);
    });

    it("Should not allow betting below minimum amount", async function () {
      const lowAmount = ethers.utils.parseEther("0.5");
      await expect(
        specificBet.connect(addr1).placeBet(1, true, { value: lowAmount })
      ).to.be.revertedWith("Bet amount too low");
    });

    it("Should not allow betting on resolved predictions", async function () {
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      
      await specificBet.resolvePrediction(1, true);
      
      const betAmount = ethers.utils.parseEther("1");
      await expect(
        specificBet.connect(addr1).placeBet(1, true, { value: betAmount })
      ).to.be.revertedWith("Prediction already resolved");
    });
  });

  describe("Prediction Resolution", function () {
    beforeEach(async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await specificBet.createPrediction(1, "Mbappé scores first", deadline, 250);
      
      // Place bets
      const betAmount = ethers.utils.parseEther("1");
      await specificBet.connect(addr1).placeBet(1, true, { value: betAmount });
      await specificBet.connect(addr2).placeBet(1, false, { value: betAmount });
    });

    it("Should pay winners correctly", async function () {
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await addr1.getBalance();
      
      // Resolve as true (Mbappé did score first)
      await specificBet.resolvePrediction(1, true);
      
      const finalBalance = await addr1.getBalance();
      expect(finalBalance.sub(initialBalance)).to.be.gt(ethers.utils.parseEther("2.4")); // 2.5x payout minus gas
    });

    it("Should not allow resolving before deadline", async function () {
      await expect(
        specificBet.resolvePrediction(1, true)
      ).to.be.revertedWith("Cannot resolve before deadline");
    });

    it("Should not allow resolving twice", async function () {
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      
      await specificBet.resolvePrediction(1, true);
      await expect(
        specificBet.resolvePrediction(1, true)
      ).to.be.revertedWith("Prediction already resolved");
    });
  });
});
