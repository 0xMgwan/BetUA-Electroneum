const hre = require("hardhat");
require('dotenv').config();

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // Get contract instances
    const specificBet = await hre.ethers.getContractAt("contracts/SpecificBet.sol:SpecificBet", process.env.SPECIFIC_BET_ADDRESS);
    const commentHub = await hre.ethers.getContractAt("contracts/CommentHub.sol:CommentHub", process.env.COMMENT_HUB_ADDRESS);
    
    // Create a prediction
    console.log("\nCreating a test prediction...");
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + (24 * 60 * 60); // 24 hours from now
    const tx1 = await specificBet.createPrediction(
      1, // gameId
      "Will ETN price reach $1 within 24 hours?", // description
      deadline,
      150 // 150% return (1.5x)
    );
    await tx1.wait();
    console.log("Prediction created!");

    // Get the prediction details
    const prediction = await specificBet.getPrediction(1);
    console.log("\nPrediction details:");
    console.log("ID:", prediction.id.toString());
    console.log("Description:", prediction.description);
    console.log("Deadline:", new Date(prediction.deadline * 1000).toLocaleString());
    console.log("Odds:", prediction.odds.toString() + "%");

    // Add a comment
    console.log("\nAdding a comment to the prediction...");
    const tx2 = await commentHub.addComment(
      1, // predictionId
      "This is an interesting prediction! The market looks bullish." // comment text
    );
    await tx2.wait();
    console.log("Comment added!");

    // Get comment count
    const commentCount = await commentHub.commentCounts(1);
    console.log("\nNumber of comments:", commentCount.toString());

    // Get comments
    console.log("\nComments for prediction 1:");
    for (let i = 0; i < commentCount; i++) {
      const comment = await commentHub.gameComments(1, i);
      console.log(`${i + 1}. ${comment.content} (by ${comment.author} at ${new Date(comment.timestamp * 1000).toLocaleString()})`);
    }

    console.log("\nAll interactions completed successfully!");

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
