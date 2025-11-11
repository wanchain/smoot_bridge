require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "london",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 100000000
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      accounts: [process.env.PK],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PK],
      chainId: 11155111, // Sepolia 的链 ID
      gas: "auto", // 自动估算 gas 限制
      gasPrice: "auto", // 自动估算 gas 价格
    }
  },
  etherscan: {
    apiKey: ''
  }
};
