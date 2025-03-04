import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// eETN Contract ABI (including unwrap methods)
const EETN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  // Unwrap methods - one of these should work
  "function withdraw(uint256 amount)",
  "function unwrap(uint256 amount)",
  "function burn(uint256 amount)",
  "function redeem(uint256 amount)"
];

// Ethereum Mainnet eETN contract address
const EETN_ADDRESS = "0x74efD06e318012cB89266F1aF03A0520F694a674";

async function main() {
  try {
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Account:", signer.address);

    // Get eETN contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_MAINNET_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const eetnContract = new ethers.Contract(EETN_ADDRESS, EETN_ABI, wallet);

    // Get contract info
    const [name, symbol, decimals] = await Promise.all([
      eetnContract.name(),
      eetnContract.symbol(),
      eetnContract.decimals()
    ]);
    console.log(`\nContract Info:`);
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);

    // Check eETN balance
    const eetnBalance = await eetnContract.balanceOf(wallet.address);
    console.log("\nCurrent Balance:");
    console.log("eETN Balance:", ethers.utils.formatEther(eetnBalance), "eETN");

    // Amount to unwrap (110 ETN for deployment and initial operations)
    const amountToUnwrap = ethers.utils.parseEther("110");

    if (eetnBalance.lt(amountToUnwrap)) {
      throw new Error(`Insufficient eETN balance. Need 110 eETN, have ${ethers.utils.formatEther(eetnBalance)} eETN`);
    }

    // Try different unwrap methods
    console.log("\nTrying to unwrap 110 eETN...");
    let tx;
    try {
      tx = await eetnContract.withdraw(amountToUnwrap);
    } catch {
      try {
        tx = await eetnContract.unwrap(amountToUnwrap);
      } catch {
        try {
          tx = await eetnContract.burn(amountToUnwrap);
        } catch {
          try {
            tx = await eetnContract.redeem(amountToUnwrap);
          } catch {
            throw new Error("Could not find the correct unwrap method. Please check the contract's source code.");
          }
        }
      }
    }

    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    await tx.wait();

    // Check new balances
    const newEetnBalance = await eetnContract.balanceOf(wallet.address);
    const newEtnBalance = await wallet.getBalance();

    console.log("\nNew Balances:");
    console.log("eETN:", ethers.utils.formatEther(newEetnBalance), "eETN");
    console.log("ETN:", ethers.utils.formatEther(newEtnBalance), "ETN");

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
