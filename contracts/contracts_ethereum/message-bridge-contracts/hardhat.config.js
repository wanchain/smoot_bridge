require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "london",
      optimizer: {
        enabled: false,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 100000000
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111, // Sepolia 的链 ID, 0x8000003c, 2147483708
      gas: "auto", // 自动估算 gas 限制
      gasPrice: "auto", // 自动估算 gas 价格
    }
  },
  etherscan: {
    apiKey: ''
  }
};
