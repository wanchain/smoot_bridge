import Web3 from "web3";

class EvmClient {
  constructor(rpc) {
    this.web3 = new Web3(rpc);
  }

  async callScFunc(contractAddress, methodName, params, abi, from = null) {
    const contract = new this.web3.eth.Contract(abi, contractAddress);
    return await contract.methods[methodName](...params).call({ from });
  }

  async getTransactionReceipt(txHash) {
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  async getTxInfo(txHash) {
    return await this.web3.eth.getTransaction(txHash);
  }

  async getBlockNumber() {
    return await this.web3.eth.getBlockNumber();
  }

  async getScEvent(contractAddress, topics, options = {}) {
    const filter = {
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
      address: contractAddress,
      topics: Array.isArray(topics) ? topics : [topics],
    };
    return await this.web3.eth.getPastLogs(filter);
  }

  async getNonce(address) {
    return await this.web3.eth.getTransactionCount(address, 'pending');
  }

  async getBalance(address) {
    return await this.web3.eth.getBalance(address);
  }

  async getTokenBalance(ownerAddress, tokenAddress) {
    const minimalABI = [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ];
    const contract = new this.web3.eth.Contract(minimalABI, tokenAddress);
    const balance = await contract.methods.balanceOf(ownerAddress).call();
    return balance;
  }

  async estimateGas(tx) {
    return await this.web3.eth.estimateGas(tx);
  }

  async getGasPrice() {
    const gasPriceWei = await this.web3.eth.getGasPrice();
    return this.web3.utils.fromWei(gasPriceWei, 'gwei');
  }

  async getErc20Allowance(tokenAddress, owner, spender) {
    const minimalABI = [
      {
        constant: true,
        inputs: [
          { name: '_owner', type: 'address' },
          { name: '_spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
    ];
    const contract = new this.web3.eth.Contract(minimalABI, tokenAddress);
    const allowance = await contract.methods.allowance(owner, spender).call();
    return allowance;
  }
}

export default EvmClient;
