import { EventEmitter } from "events";
import CrossChainTaskRecords from "./stores/CrossChainTaskRecords.js";
import CrossChainTask from "./stores/CrossChainTask.js";
import AssetPairs from "./stores/AssetPairs.js";
import StartService from "../gsp/startService/startService.js";
import BridgeTask from "./bridgeTask.js";
import tool from "../utils/tool.js";
import BigNumber from "bignumber.js";

const TaskInfoMapping = {
  "taskId": "ccTaskId",
  "pairId": "assetPairId",
  "asset": "assetType",
  "fromChain": "fromChainName",
  "toChain": "toChainName",
};

class SmootBridge extends EventEmitter {
  constructor(network = "testnet") {
    super();
    this.network = (network == "mainnet") ? "mainnet" : "testnet";
    this.stores = {
      crossChainTaskRecords: new CrossChainTaskRecords(),
      assetPairs: new AssetPairs(),
    };
  }

  async init(options = {}) {
    console.debug("SDK: init, network: %s, ver: 2601051917", this.network);
    this._service = new StartService();
    await this._service.init(this.network, this.stores, options);
    this.configService = this._service.getService("ConfigService");
    this.eventService = this._service.getService("EventService");
    this.storemanService = this._service.getService("StoremanService");
    this.storageService = this._service.getService("StorageService");
    this.feesService = this._service.getService("CrossChainFeesService");
    this.chainInfoService = this._service.getService("ChainInfoService");
    this.tokenPairService = this._service.getService("TokenPairService");
    this.txTaskHandleService = this._service.getService("TxTaskHandleService");
    this.cctHandleService = this._service.getService("CCTHandleService");
    this.eventService.addEventListener("ReadStoremanInfoComplete", this._onStoremanInitilized.bind(this)); // for token pair service to notify data ready
    this.eventService.addEventListener("RedeemTxHash", this._onRedeemTxHash.bind(this)); // for all to notify redeem txHash
    this.eventService.addEventListener("TaskStepResult", this._onTaskStepResult.bind(this)); // for tx receipt service to update result
    await this._service.start();
  }

  async checkWallet(chainName, wallet) {
    console.debug("SDK: checkWallet, chainName: %s, wallet: %s", chainName, wallet ? wallet.name : undefined);
    let chainType = this.tokenPairService.getChainType(chainName);
    let chainInfo = this.chainInfoService.getChainInfoByType(chainType);
    if (chainInfo.walletChainId !== undefined) {
      if (wallet && wallet.getChainId) {
        let walletChainId = await wallet.getChainId();
        if (chainInfo.walletChainId == walletChainId) {
          return true;
        } else {
          console.debug("SDK: checkWallet id %s != %s", walletChainId, chainInfo.walletChainId);
          return false;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  async createTask(assetType, fromChainName, toChainName, amount, fromAccount, toAccount, options = {}) {
    console.debug("SDK: createTask at %s ms, assetType: %s, fromChainName: %s, toChainName: %s, amount: %O, fromAccount: %s, toAccount: %s, options: %O",
      tool.getCurTimestamp(), assetType, fromChainName, toChainName, amount, fromAccount, toAccount, this._getDebugOptions(options));
    let tokenPair = this._matchTokenPair(assetType, fromChainName, toChainName, options);
    let wallet = options.wallet;
    // check fromAccount
    if (fromAccount) {
      if (!this.validateAddress(fromChainName, fromAccount)) {
        throw new Error("Invalid fromAccount");
      }
    } else {
      throw new Error("Missing fromAccount");
    }
    // check toAccount
    if (!(toAccount && this.validateAddress(toChainName, toAccount))) {
      throw new Error("Invalid toAccount");
    }
    // check wallet
    if (!wallet) {
      throw new Error("Missing wallet");
    }
    // create task
    let direction = (fromChainName === tokenPair.fromChainName) ? "MINT" : "BURN";
    let task = new BridgeTask(this, tokenPair, direction, fromAccount, toAccount, amount, wallet);
    await task.init(options);
    await task.start();
    return task;
  }

  async getAccountBalance(assetType, chainName, account, options = {}) {
    console.debug("SDK: getAccountBalance, assetType: %s, chainName: %s, account: %s, options: %O", assetType, chainName, account, this._getDebugOptions(options));
    let tokenPair = this._matchTokenPair(assetType, chainName, chainName, options);
    let chainType = this.tokenPairService.getChainType(chainName);
    let balance = await this.storemanService.getAccountBalance(tokenPair.id, chainType, account, options);
    balance = balance.toFixed();
    console.debug("SDK: getAccountBalance, result: %s", balance);
    return balance;
  }

  async estimateFee(assetType, fromChainName, toChainName, options = {}) {
    console.debug("SDK: estimateFee, assetType: %s, fromChainName: %s, toChainName: %s, options: %O", assetType, fromChainName, toChainName, options);
    let tokenPair = this._matchTokenPair(assetType, fromChainName, toChainName, options);
    let fromChainType = this.tokenPairService.getChainType(fromChainName);
    let toChainType = this.tokenPairService.getChainType(toChainName);
    if (tokenPair.bridge) {
      options.bridge = tokenPair.bridge;
    }
    let [operateFee, networkFee] = await Promise.all([
      this.feesService.estimateOperationFee(tokenPair.id, fromChainType, toChainType, options),
      this.feesService.estimateNetworkFee(tokenPair.id, fromChainType, toChainType, options)
    ]);
    let prices = {};
    let fee = {
      operateFee: {
        value: operateFee.fee,
        unit: operateFee.unit,
        price: prices[operateFee.unit] || "",
        isRatio: operateFee.isRatio,
        min: operateFee.min,
        max: operateFee.max,
        decimals: operateFee.decimals,
        discount: operateFee.discount
      },
      networkFee: {
        value: networkFee.fee,
        unit: networkFee.unit,
        price: prices[networkFee.unit] || "",
        isRatio: networkFee.isRatio,
        min: networkFee.min,
        max: networkFee.max,
        decimals: networkFee.decimals,
        discount: networkFee.discount
      }
    };
    console.debug("SDK: estimateFee, result: %O", fee);
    return fee;
  }

  async getQuota(assetType, fromChainName, toChainName, options = {}) {
    console.debug("SDK: getQuota, assetType: %s, fromChainName: %s, toChainName: %s, options: %O", assetType, fromChainName, toChainName, options);
    let quota = {maxQuota: Infinity.toString(), minQuota: "0"};
    console.debug("SDK: getQuota, result: %O", quota);
    return quota;
  }

  validateAddress(chainName, address, options = {}) {
    options = Object.assign({ debug: true, checkToken: true }, options);
    let chainType = this.tokenPairService.getChainType(chainName);
    let result = this.storemanService.validateAddress(chainType, address);
    if (result === false) {
      if (options.debug) {
        console.log("SDK: validateAddress, chainName: %s, address: %s, result: %s", chainName, address, result);
      }
      return false;
    }
    let extension = this.configService.getExtension(chainType);
    if (options.checkToken && this.stores.assetPairs.isTokenAccount(chainType, address, extension)) {
      console.error("SDK: validateAddress, chainName: %s, address: %s, result: is token address", chainName, address);
      return false;
    }
    return true;
  }

  async validateRecipient(chainName, address) {
    let valid = this.validateAddress(chainName, address);
    if (valid === false) {
      console.log("SDK: validateRecipient, chainName: %s, address: %s, result: %s", chainName, address, valid);
    }
    return valid;
  }

  getHistoryNumber(options) {
    let records = this.stores.crossChainTaskRecords;
    let number = records.getTaskNumber(options.protocols);
    console.debug("SDK: getHistoryNumber, options: %O, number: %O", options, number);
    return number;
  }

  getHistory(options = {}) {
    let all = [];
    let records = this.stores.crossChainTaskRecords;
    if (options.taskId) { // single
      let task = records.getTaskById(options.taskId);
      if (task) {
        all.push(task);
      }
    } else if ((options.page !== undefined) && options.number) { // page
      all = records.getTaskByPage(options.page, options.number, options.protocols);
    }
    let history = all.map(task => {
      let item = {
        taskId: task.ccTaskId,
        pairId: task.assetPairId,
        timestamp: task.ccTaskId,
        asset: task.assetType,
        protocol: task.protocol,
        bridge: task.bridge,
        fromSymbol: task.fromSymbol,
        toSymbol: task.toSymbol,
        fromChain: task.fromChainName,
        toChain: task.toChainName,
        amount: task.sentAmount || task.amount,
        fromDecimals: task.fromDecimals,
        toDecimals: task.toDecimals,
        receivedAmount: task.receivedAmount,
        fee: task.fee,
        fromAccount: task.fromAccount,
        toAccount: task.toAccount,
        lockHash: task.lockHash,
        redeemHash: task.redeemHash,
        uniqueId: task.uniqueId || "",
        status: task.status,
        errInfo: task.errInfo
      };
      if (task.assetAlias) {
        item.assetAlias = task.assetAlias;
      }
      return item;
    });
    console.debug("SDK: getHistory, options: %O, count: %O", options, history);
    return history;
  }

  async deleteHistory(options = {}) {
    let count = 0;
    let records = this.stores.crossChainTaskRecords;
    let delIdSet = new Set(options.taskIds);
    let ids = Array.from(records.ccTaskRecords.values())
      .filter(v => (((delIdSet.size === 0) || delIdSet.has(v.ccTaskId)) && ((options.protocols === undefined) || (options.protocols.includes(v.protocol)))))
      .map(v => v.ccTaskId);
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      records.removeTradeTask(id);
      await this.storageService.delete("crossChainTaskRecords", id);
      count++;
    }
    console.debug("SDK: deleteHistory, options: %O, count: %d", options, count);
    return count;
  }

  async insertHistory(info) {
    let taskId = Date.now();
    console.debug("SDK: insertHistory, taskId: %d, bridge: %s, extent: %O", taskId, info.bridge);
    let task = new CrossChainTask(taskId);
    let innerInfo = {};
    for (let k in info) {
      innerInfo[TaskInfoMapping[k] || k] = info[k];
    }
    task.setTaskData(innerInfo);
    this.stores.crossChainTaskRecords.addNewTradeTask(task.ccTaskData);
    await this.storageService.save("crossChainTaskRecords", taskId, task.ccTaskData);
    return taskId;
  }

  async updateHistory(info) {
    let records = this.stores.crossChainTaskRecords;
    let task = records.getTaskById(info.taskId);
    if (task) {
      let innerInfo = {};
      for (let k in info) {
        let innerKey = TaskInfoMapping[k] || k;
        if (task[innerKey] !== undefined) {
          innerInfo[innerKey] = info[k];
        }
      }
      records.setExtraInfo(info.taskId, innerInfo, true);
      await this.storageService.save("crossChainTaskRecords", info.taskId, task);
    } else {
      console.error("task %d is not exist", info.taskId);
    }
  }

  getAssetLogo(name, protocol) {
    return this.tokenPairService.getAssetLogo(name, protocol);
  }

  getChainLogo(chainName) {
    let chainType = this.tokenPairService.getChainType(chainName);
    return this.tokenPairService.getChainLogo(chainType);
  }

  formatTokenAccount(chainName, tokenAccount) {
    try {
      if (tokenAccount === "0x0000000000000000000000000000000000000000") {
        return tokenAccount;
      }
      let chainType = this.tokenPairService.getChainType(chainName);
      return tool.getStandardAddressInfo(chainType, tokenAccount, this.configService.getExtension(chainType)).native;
    } catch (err) {
      console.error("SDK: formatTokenAccount, chainName: %s, tokenAccount: %s, error: %O", chainName, tokenAccount, err);
      return tokenAccount;
    }
  }

  getFromChains(options) {
    let fromChainSet = new Set();
    let assetPairList = this.stores.assetPairs.assetPairList;
    for (let pair of assetPairList) {
      if (options.protocols.includes(pair.protocol)) {
        if (pair.direction === "both") {
          fromChainSet.add(pair.fromChainName);
          fromChainSet.add(pair.toChainName);
        } else if (pair.direction === "f2t") {
          fromChainSet.add(pair.fromChainName);
        } else { // t2f
          fromChainSet.add(pair.toChainName);
        }
      }
    }
    return Array.from(fromChainSet);
  }

  async getChainAssets(options) {
    console.debug("SDK: getChainAssets, options: %O", this._getDebugOptions(options));
    let ts0 = Date.now();
    let chains = options.chainNames || this.getFromChains(options);
    let prices = {};
    if (options.price && options.protocols.includes("Erc20")) {
      let assetNameSet = new Set();
      let assetPairList = this.stores.assetPairs.assetPairList;
      assetPairList.forEach(pair => {
        if (options.protocols.includes(pair.protocol)) {
          if (chains.includes(pair.fromChainName) || chains.includes(pair.toChainName)) {
            assetNameSet.add(pair.assetAlias || pair.assetType);
          }
        }
      });
    }
    let ts1 = Date.now();
    let assetInfos = await Promise.all(chains.map(chain => this._getChainAssets(chain, prices, options, ts1)));
    let result = {};
    chains.forEach((v, i) => result[v] = assetInfos[i]);
    let ts2 = Date.now();
    console.debug("getChainAssets consume %s ms", ts2 - ts0);
    return result;
  }

  getToChains(assetType, fromChainName, options) {
    let toChainSet = new Set();
    let assetPairList = this.stores.assetPairs.assetPairList;
    for (let pair of assetPairList) {
      if (((pair.assetAlias || pair.assetType) === assetType) && options.protocols.includes(pair.protocol)) {
        if (pair.fromChainName === fromChainName) {
          if (["both", "f2t"].includes(pair.direction)) {
            toChainSet.add(pair.toChainName);
          }
        }
        if (pair.toChainName === fromChainName) {
          if (["both", "t2f"].includes(pair.direction)) {
            toChainSet.add(pair.fromChainName);
          }
        }
      }
    }
    return Array.from(toChainSet);
  }

  getAssetPairInfo(assetType, fromChainName, toChainName, options) {
    let tokenPair = this._matchTokenPair(assetType, fromChainName, toChainName, options);
    let from = {
      chain: tokenPair.fromChainName,
      symbol: tokenPair.fromSymbol,
      address: this.formatTokenAccount(tokenPair.fromChainName, tokenPair.fromAccount),
      decimals: tokenPair.fromDecimals,
      isNative: tokenPair.fromIsNative,
      issuer: tokenPair.fromIssuer
    };
    let to = {
      chain: tokenPair.toChainName,
      symbol: tokenPair.toSymbol,
      address: this.formatTokenAccount(tokenPair.toChainName, tokenPair.toAccount),
      decimals: tokenPair.toDecimals,
      isNative: tokenPair.toIsNative,
      issuer: tokenPair.toIssuer
    };
    let result = (tokenPair.fromChainName === fromChainName) ? { from: from, to: to } : { from: to, to: from };
    result.bridge = tokenPair.bridge;
    return result;
  }

  async _getChainAssets(chainName, prices, options, startTime) {
    let chainType = this.tokenPairService.getChainType(chainName);
    let assets = this.tokenPairService.getChainAssets(chainType, options);
    // console.log("%s _getChainAssets assets: %O", chainName, assets);
    let balances = {}, assetInfos = [];
    for (let asset in assets) {
      assetInfos.push({
        asset,
        symbol: assets[asset].symbol,
        address: this.formatTokenAccount(chainName, assets[asset].address),
        decimals: assets[asset].decimals,
        protocol: assets[asset].protocol,
        balance: balances[asset] || "",
        price: prices[asset] || ""
      });
    }
    let time = Date.now() - startTime;
    if (time >= 3000) {
      console.debug("%s _getChainAssets %O consume %s ms", chainName, options, time);
    }
    return assetInfos;
  }

  getChainInfo(chainName) {
    let chainInfo = this.chainInfoService.getChainInfoByName(chainName);
    if (chainInfo) {
      return {
        chainName,
        bip44ChainId: chainInfo.chainId,
        symbol: chainInfo.symbol || chainInfo.chainType,
        chainId: chainInfo.walletChainId,
        blockTime: chainInfo.blockTime || 12,
        blockConfirmations: chainInfo.blockConfirmations || 1,
        explorer: chainInfo.explorer
      }
    }
    return null;
  }

  _onStoremanInitilized(success) {
    if (success) {
      let assetPairList = this.stores.assetPairs.assetPairList;
      this._distributeEvent("ready", assetPairList.map(v => Object.assign({}, v)));
      console.debug("SmootBridge is ready for %d assetPairs", assetPairList.length);
    } else {
      this._distributeEvent("error", { reason: "Failed to initialize storeman" });
      console.error("SmootBridge has error");
    }
  }

  async _onRedeemTxHash(taskRedeemHash) {
    console.debug("_onRedeemTxHash: %O", taskRedeemHash);
    let records = this.stores.crossChainTaskRecords;
    let taskId = taskRedeemHash.ccTaskId;
    let txHash = taskRedeemHash.txHash;
    let ccTask = records.ccTaskRecords.get(taskId);
    if (!ccTask) {
      return;
    }
    // status
    let status = "Succeeded", errInfo = "";
    // received amount, TODO: get actual value from chain
    let receivedAmount;
    if (ccTask.protocol === "Erc20") {
      let sentAmount = ccTask.sentAmount || ccTask.amount;
      let expected = new BigNumber(sentAmount);
      let fee = tool.parseFee(ccTask.fee, expected, ccTask.assetType);
      expected = expected.minus(fee).toFixed();
      if (taskRedeemHash.value) {
        receivedAmount = new BigNumber(taskRedeemHash.value).div(Math.pow(10, ccTask.toDecimals)).toFixed();
      } else {
        receivedAmount = expected;
      }
    } else {
      receivedAmount = ccTask.amount;
    }
    records.modifyTradeTaskStatus(taskId, status, errInfo);
    records.setTaskRedeemTxHash(taskId, txHash, receivedAmount);
    this.storageService.save("crossChainTaskRecords", taskId, ccTask);
    this._distributeEvent("redeem", { taskId, txHash });
  }

  async _onTaskStepResult(taskStepResult) {
    console.debug("_onTaskStepResult: %O", taskStepResult);
    let taskId = taskStepResult.ccTaskId;
    let stepIndex = taskStepResult.stepIndex;
    let txHash = taskStepResult.txHash;
    let result = taskStepResult.result;
    let errInfo = taskStepResult.errInfo || "";
    let records = this.stores.crossChainTaskRecords;
    let ccTask = records.ccTaskRecords.get(taskId);
    if (ccTask) {
      this.stores.crossChainTaskRecords.finishTaskStep(taskId, stepIndex, txHash, result, errInfo);
      let { isLockTx, isLocked } = records.updateTaskByStepResult(taskId, stepIndex, txHash, result, errInfo);
      if (isLockTx) {
        let lockEvent = { taskId, txHash };
        await this._distributeEvent("lock", lockEvent);
      }
      if (isLocked) {
        let lockedEvent = { taskId, txHash };
        console.debug("lockedEvent: %O", lockedEvent);
        this._distributeEvent("locked", lockedEvent);
      }
      this.storageService.save("crossChainTaskRecords", taskId, ccTask);
    }
  }

  async _distributeEvent(name, data) {
    this.emit(name, data);
    console.debug("_distributeEvent %s: %O", name, data);
  }

  _matchTokenPair(assetType, fromChainName, toChainName, options = {}) {
    let protocol = options.protocol || "Erc20";
    let assetPairList = this.stores.assetPairs.assetPairList;
    for (let i = 0; i < assetPairList.length; i++) {
      let pair = assetPairList[i];
      // sometimes there are temporary two bridges for the same asset crosschain, need to be specified by assetPairId
      if (((pair.assetAlias || pair.assetType) === assetType) && (pair.protocol === protocol) && ((!options.assetPairId) || (options.assetPairId === pair.assetPairId))) {
        // if fromChainName and toChainName are the same, find any one of related pairs
        if ([pair.fromChainName, pair.toChainName].includes(fromChainName) && [pair.fromChainName, pair.toChainName].includes(toChainName)) {
          let tokenPair = this.tokenPairService.getTokenPair(pair.assetPairId);
          if (tokenPair) {
            return tokenPair;
          } else {
            console.error("tokenpair %s data is corrupted", pair.assetPairId);
            break;
          }
        }
      }
    }
    throw new Error("Asset pair not exist");
  }

  _getDebugOptions(options) {
    let opt = Object.assign({}, options);
    // only display wallet name
    if (opt.wallet) {
      opt.wallet = opt.wallet.name;
    }
    return opt;
  }
}

export default SmootBridge;
