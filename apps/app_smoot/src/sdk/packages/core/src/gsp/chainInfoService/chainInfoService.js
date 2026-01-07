import EvmClient from "./evmClient";

class ChainInfoService {
  constructor() {
    this.chainId2Info = new Map();
    this.chainName2Info = new Map();
    this.chainType2Info = new Map();
  }

  async init(frameworkService) {
    this.m_frameworkService = frameworkService;
    let configService = frameworkService.getService("ConfigService");
    let evmChains = configService.getGlobalConfig("StoremanService");
    for (let chain of evmChains) {
      this.chainId2Info.set(chain.chainId, chain);
      this.chainName2Info.set(chain.chainName, chain);
      this.chainType2Info.set(chain.chainType, chain);
      chain._isEVM = true;
      chain.client = new EvmClient(chain.rpc);
    }
    let noEvmChains = configService.getGlobalConfig("noEthChainInfo");
    for (let chain of noEvmChains) {
      this.chainId2Info.set(chain.chainId, chain);
      this.chainName2Info.set(chain.chainName, chain);
      this.chainType2Info.set(chain.chainType, chain);
    }
  }

  getChainInfoById(chainId) {
    return this.chainId2Info.get(chainId);
  }

  getChainInfoByName(chainName) {
    return this.chainName2Info.get(chainName);
  }

  getChainInfoByType(chainType) {
    return this.chainType2Info.get(chainType);
  }

  getCoinSymbol(chainType) {
    let chain = this.chainType2Info.get(chainType);
    return chain.symbol || chainType;
  }

  // client api

  async getErc20Allowance(chainType, scAddr, ownerAddr, spenderAddr) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getErc20Allowance(scAddr, ownerAddr, spenderAddr);
  }

  async callScFunc(chainType, scAddr, name, args, abi) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.callScFunc(scAddr, name, args, abi);
  }

  async getTransactionReceipt(chainType, txHash) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getTransactionReceipt(txHash);
  }

  async getTxInfo(chainType, txHash) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getTxInfo(txHash);
  }

  async getBlockNumber(chainType) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getBlockNumber();
  }

  async getScEvent(chainType, address, topics, option) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getScEvent(address, topics, option);
  }

  async getNonce(chainType, addr) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getNonce(addr);
  }

  async getBalance(chainType, addr) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getBalance(addr);
  }

  async getTokenBalance(chainType, accountAddr, tokenAddr) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.getTokenBalance(accountAddr, tokenAddr);
  }

  async estimateGas(chainType, tx) {
    let chain = this.getChainInfoByType(chainType);
    return await chain.client.estimateGas(tx);
  }
}

export default ChainInfoService;
