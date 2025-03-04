const { ethers } = require('ethers');

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('New Wallet Generated:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('\nIMPORTANT: Save this private key securely and never share it!');
console.log('You can use this wallet for testnet operations.');
