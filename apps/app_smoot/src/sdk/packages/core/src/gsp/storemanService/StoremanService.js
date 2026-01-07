import BigNumber from "bignumber.js";
import tool from "../../utils/tool.js";

// wmb InboundTaskExecuted
const OutboundTaskExecuted = "0x9f7186752cdee7e5cd6934f66fd3f1fed9b13406486ad5196ce0d20d6db81579";

class StoremanService {
  constructor() {
  }

  async init(frameworkService, options) {
    this.frameworkService = frameworkService;
    this.chainInfoService = frameworkService.getService("ChainInfoService");
    this.configService = frameworkService.getService("ConfigService");
    this.crossTaskCfg = this.configService.getGlobalConfig("crossTask");
  }

  validateAddress(chainType, address) {
    return tool.isValidEthAddress(address);
  }

  async getAccountBalance(assetPairId, chainType, addr, options = {}) {
    try {
      let tokenPairService = this.frameworkService.getService("TokenPairService");
      let tokenPair = tokenPairService.getTokenPair(assetPairId);
      if (!tokenPair) {
        return new BigNumber(0);
      }
      let balance = 0, decimals;
      let direction = (chainType === tokenPair.fromChainType);
      let tokenAccount = direction ? tokenPair.fromAccount : tokenPair.toAccount;
      let chainInfo = this.chainInfoService.getChainInfoByType(chainType);
      let isCoin = options.isCoin || (tokenAccount === "0x0000000000000000000000000000000000000000");
      if (isCoin) {
        decimals = direction ? tokenPair.fromScInfo.chainDecimals : tokenPair.toScInfo.chainDecimals;
        if (options.wallet && options.wallet.getBalance) { // prefer to get balance from wallet
          balance = await options.wallet.getBalance(addr);
        } else {
          balance = await this.chainInfoService.getBalance(chainType, addr);
        }
      } else {
        decimals = direction ? tokenPair.fromDecimals : tokenPair.toDecimals;
        if (chainInfo._isEVM) {
          balance = await this.chainInfoService.getTokenBalance(chainType, addr, tokenAccount);
        } else if (options.wallet && options.wallet.getBalance) { // non EVM, tokenAccount is encoded as ascii by default
          balance = await options.wallet.getBalance(addr, tool.ascii2letter(tool.hexStrip0x(tokenAccount)));
        }
      }
      balance = new BigNumber(balance).div(Math.pow(10, decimals));
      console.debug("get %s %s address %s balance: %s", chainType, isCoin ? "coin" : ("token " + tokenAccount), addr, balance.toFixed());
      return balance;
    } catch (err) {
      console.error("get %s address %s balance error: %O", chainType, addr, err);
      return new BigNumber(0);
    }
  }

  async getChainBlockNumber(chainType, options = {}) {
    try {
      let blockNumber = await this.chainInfoService.getBlockNumber(chainType);
      return blockNumber;
    } catch (err) {
      console.log("%s getChainBlockNumber error: %O", chainType, err);
      return 0; // should retry later
    }
  }

  async parseSmootWmbTaskId(fromChain, txHash) {
    let taskId = "";
    let receipt = await this.chainInfoService.getTransactionReceipt(fromChain, txHash);
    for (let log of receipt.logs) {
      if (log.topics[0] === OutboundTaskExecuted) {
        taskId = log.topics[1];
        console.debug("parseSmootWmbTaskId for chain %s tx %s: %s", fromChain, txHash, taskId);
        break;
      }
    }
    return taskId;
  }

  async waitTxReceipt(chainType, txHash, timeout = 0, interval = 5000) {
    let t0 = Date.now();
    for (; ;) {
      try {
        let receipt = await this.chainInfoService.getTransactionReceipt(chainType, txHash);
        if (receipt) {
          return receipt;
        }
      } catch (err) {
        // console.error("waitTxReceipt error: %O", err);
      }
      if ((Date.now() - t0) < timeout) {
        await tool.sleep(interval);
      } else {
        console.debug("waitTxReceipt %d ms unavailable", timeout);
        return null;
      }
    }
  }
}

export default StoremanService;
