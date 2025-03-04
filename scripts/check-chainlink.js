const { ethers } = require("hardhat");

async function main() {
  console.log("Checking Chainlink on Electroneum testnet...");
  
  // Get the network
  const network = await ethers.provider.getNetwork();
  console.log("Network:", {
    name: network.name,
    chainId: network.chainId
  });

  // Try to connect to known Chainlink contracts
  const LINK_TOKEN_CONTRACT = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
  const ORACLE_REGISTRY = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";
  
  try {
    const linkTokenABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)"
    ];

    const linkToken = new ethers.Contract(LINK_TOKEN_CONTRACT, linkTokenABI, ethers.provider);
    
    try {
      const name = await linkToken.name();
      const symbol = await linkToken.symbol();
      console.log("LINK Token found:", { name, symbol });
    } catch (e) {
      console.log("❌ Could not find LINK token contract");
    }

    // Check if there's any code at the oracle registry address
    const code = await ethers.provider.getCode(ORACLE_REGISTRY);
    if (code !== "0x") {
      console.log("✅ Found code at Oracle Registry address");
    } else {
      console.log("❌ No code found at Oracle Registry address");
    }

  } catch (error) {
    console.error("Error checking Chainlink contracts:", error.message);
  }

  // Check for any known Chainlink Price Feeds
  const KNOWN_PRICE_FEEDS = [
    "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD
    "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c", // LINK/USD
  ];

  console.log("\nChecking for Price Feeds...");
  for (const feed of KNOWN_PRICE_FEEDS) {
    try {
      const code = await ethers.provider.getCode(feed);
      if (code !== "0x") {
        console.log(`✅ Found Price Feed at ${feed}`);
      } else {
        console.log(`❌ No Price Feed at ${feed}`);
      }
    } catch (error) {
      console.log(`❌ Error checking Price Feed ${feed}:`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
