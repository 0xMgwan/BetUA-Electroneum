require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    electroneum: {
      url: 'https://rpc.ankr.com/electroneum',
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: 'empty',
    customChains: [
      {
        network: "electroneum",
        chainId: 52014,
        urls: {
          apiURL: "https://blockexplorer.electroneum.com/api",
          browserURL: "https://blockexplorer.electroneum.com"
        }
      }
    ]
  }
};
