import tool from "../utils/tool.js";
import CrossChainTask from "./stores/CrossChainTask.js";
import BigNumber from "bignumber.js";

class BridgeTask {
  constructor(bridge, tokenPair, direction, fromAccount, toAccount, amount, wallet) {
    this.id = Date.now();
    this._bridge = bridge;
    this._tokenPair = tokenPair;
    this._direction = direction;
    this._fromAccount = fromAccount;
    this._toAccount = toAccount;
    this._amount = new BigNumber(amount).toFixed();
    this._wallet = wallet;
    let fromChainInfo = {
      symbol: tokenPair.fromSymbol,
      decimals: tokenPair.fromDecimals,
      chainType: bridge.tokenPairService.getChainType(tokenPair.fromChainName),
      chainName: tokenPair.fromChainName
    };
    let toChainInfo = {
      symbol: tokenPair.toSymbol,
      decimals: tokenPair.toDecimals,
      chainType: bridge.tokenPairService.getChainType(tokenPair.toChainName),
      chainName: tokenPair.toChainName
    };
    if (this._direction == 'MINT') {
      this._fromChainInfo = fromChainInfo;
      this._toChainInfo = toChainInfo;
    } else {
      this._fromChainInfo = toChainInfo;
      this._toChainInfo = fromChainInfo;
    }
    // smg info
    // server side para
    this._fee = null;
    // storage
    this._task = new CrossChainTask(this.id);
  }

  async init(options) {
    console.debug("bridgeTask init at %s ms", tool.getCurTimestamp());
    // check
    let validWallet = await this._bridge.checkWallet(this._fromChainInfo.chainName, this._wallet);
    if (!validWallet) {
      throw new Error("Invalid wallet");
    }
    let err = await this._checkFee();
    if (err) {
      throw new Error(err);
    }
    let [fromAccountErr, toAccountErr] = await Promise.all([
      this._checkFromAccount(),
      this._checkToAccount(options)
    ]);
    err = fromAccountErr || toAccountErr;
    if (err) {
      throw new Error(err);
    }
    // set task data
    let taskData = {
      assetPairId: this._tokenPair.id,
      assetType: this._tokenPair.readableSymbol,
      assetAlias: this._tokenPair.assetAlias,
      protocol: this._tokenPair.protocol,
      direction: this._direction,
      amount: this._amount,
      bridge: this._tokenPair.bridge,
      fromAccount: this._fromAccount,
      toAccount: this._toAccount,
      fromChainName: this._fromChainInfo.chainName,
      toChainName: this._toChainInfo.chainName,
      fromSymbol: this._fromChainInfo.symbol,
      toSymbol: this._toChainInfo.symbol,
      fromDecimals: this._fromChainInfo.decimals,
      toDecimals: this._toChainInfo.decimals,
      fromChainType: this._fromChainInfo.chainType,
      toChainType: this._toChainInfo.chainType,
      fee: this._fee,
    };
    // console.debug({taskData});
    this._task.setTaskData(taskData);
  }

  async start() {
    console.debug("bridgeTask tokenpair %s start at %s ms", this._tokenPair.id, tool.getCurTimestamp());
    // build
    let steps = await this._buildTaskSteps();
    this._task.initSteps(steps);
    this._task.setTaskData({ status: "Performing" });
    // save context
    let bridge = this._bridge;
    let ccTaskData = this._task.ccTaskData;
    bridge.stores.crossChainTaskRecords.addNewTradeTask(ccTaskData);
    await bridge.storageService.save("crossChainTaskRecords", ccTaskData.ccTaskId, ccTaskData);
    // process
    this._procTaskSteps();
  }

  async _checkFee() {
    let options = {protocol: this._tokenPair.protocol, address: [this._fromAccount || "", this._toAccount]};
    let isErc20 = (this._tokenPair.protocol === "Erc20");
    // should use assetAlias as assetType to call bridge external api
    this._fee = await this._bridge.estimateFee((this._tokenPair.assetAlias || this._tokenPair.readableSymbol), this._fromChainInfo.chainName, this._toChainInfo.chainName, options);
    if (isErc20) {
      let assetFee = tool.parseFee(this._fee, this._amount, this._tokenPair.readableSymbol);
      if (new BigNumber(assetFee).gte(this._amount)) { // input amount includes fee
        console.error("Amount is too small to pay the bridge fee: %s %s", assetFee, this._tokenPair.readableSymbol);
        return "Amount is too small to pay the bridge fee";
      }
    }
    return "";
  }

  async _checkFromAccount() {
    let chainType = this._fromChainInfo.chainType;
    let coinBalance = await this._bridge.storemanService.getAccountBalance(this._tokenPair.id, chainType, this._fromAccount, { wallet: this._wallet, isCoin: true });
    let assetBalance;
    let coinSymbol = this._bridge.chainInfoService.getCoinSymbol(chainType);
    let requiredCoin = new BigNumber(0);
    let requiredAsset = 0;
    if (this._tokenPair.readableSymbol === coinSymbol) { // asset is coin
      assetBalance = coinBalance;
      requiredCoin = requiredCoin.plus(this._amount); // includes fee
      requiredAsset = 0;
    } else {
      assetBalance = await this._bridge.storemanService.getAccountBalance(this._tokenPair.id, chainType, this._fromAccount, { wallet: this._wallet });
      requiredCoin = requiredCoin.plus(tool.parseFee(this._fee, this._amount, coinSymbol));
      requiredAsset = this._amount;
    }
    console.debug("required coin balance: %s/%s", requiredCoin.toFixed(), coinBalance.toFixed());
    if (coinBalance.lt(requiredCoin)) {
      return "Insufficient balance";
    }
    if (this._tokenPair.protocol === "Erc20") {
      console.debug("required asset balance: %s/%s", requiredAsset, assetBalance.toFixed());
      if (assetBalance.lt(requiredAsset)) {
        return "Insufficient asset";
      }
    }
    return "";
  }

  async _checkToAccount(options) {
    return "";
  }

  async _buildTaskSteps() {
    let ccTaskData = this._task.ccTaskData;
    // to get the stepsFunc from server api
    let convert = {
      ccTaskId: ccTaskData.ccTaskId,
      tokenPairId: ccTaskData.assetPairId,
      convertType: ccTaskData.convertType,
      fromSymbol: ccTaskData.fromSymbol,
      fromAddr: ccTaskData.fromAccount,
      toSymbol: ccTaskData.toSymbol,
      toAddr: ccTaskData.toAccount,
      value: ccTaskData.amount,
      fee: this._fee,
      wallet: this._wallet
    };
    // console.debug("checkTaskSteps: %O", convert);
    let steps = await this._bridge.cctHandleService.getConvertInfo(convert);
    // console.debug("getConvertInfo: %O", steps);
    return steps;
  }

  async _procTaskSteps() {
    let steps = this._task.ccTaskData.stepData;
    console.debug("bridgeTask _procTaskSteps total %d at %s ms", steps.length, tool.getCurTimestamp());
    let curStep = 0, executedStep = -1, stepTxHash = "";
    for (; curStep < steps.length;) {
      let taskStep = steps[curStep];
      let stepResult = taskStep.stepResult;
      if (!stepResult) {
        if (taskStep.txHash && !stepTxHash) {
          await this._updateTaskByStepData(taskStep.stepIndex, taskStep.txHash, ""); // only update txHash, no result
          stepTxHash = taskStep.txHash;
        }
        if (executedStep != curStep) {
          console.debug("bridgeTask _procTaskSteps step %s at %s ms", curStep, tool.getCurTimestamp());
          await this._bridge.txTaskHandleService.processTxTask(taskStep, this._wallet);
          executedStep = curStep;
        } else {
          await tool.sleep(3000);
        }
        continue;
      }
      console.debug("proc task %d step %d: %O", this.id, curStep, taskStep);
      if (["Failed", "Rejected"].includes(stepResult)) {
        await this._updateTaskByStepData(taskStep.stepIndex, taskStep.txHash, stepResult, taskStep.errInfo);
        this._bridge._distributeEvent("error", { taskId: this.id, reason: taskStep.errInfo || stepResult });
        break;
      }
      await this._updateTaskByStepData(taskStep.stepIndex, taskStep.txHash, stepResult, taskStep.errInfo);
      curStep++;
      stepTxHash = "";
    }
  }

  async _updateTaskByStepData(stepIndex, txHash, stepResult, errInfo = "") {
    let records = this._bridge.stores.crossChainTaskRecords;
    let ccTask = records.ccTaskRecords.get(this.id);
    if (ccTask) {
      let { isLockTx, isLocked } = records.updateTaskByStepResult(this.id, stepIndex, txHash, stepResult, errInfo);
      if (isLockTx) {
        let lockEvent = { taskId: this.id, txHash };
        console.debug("lockTxHash: %O", lockEvent);
        this._bridge._distributeEvent("lock", lockEvent);
      }
      if (isLocked) {
        let lockedEvent = { taskId: this.id, txHash };
        console.debug("lockedEvent: %O", lockedEvent);
        this._bridge._distributeEvent("locked", lockedEvent);
      }
      this._bridge.storageService.save("crossChainTaskRecords", this.id, ccTask);
    }
  }
}

export default BridgeTask;
