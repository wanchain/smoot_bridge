import tool from "../../utils/tool.js";

const DefaultScanBatchSize = 1000;

const CustomizedScanBatchSize = {
  ETH: 500,
  MATIC: 100
};

class CheckTxReceiptService {
  constructor() {
    this.taskArray = [];
  }

  async init(frameworkService) {
    this.frameworkService = frameworkService;
    this.taskService = frameworkService.getService("TaskService");
    this.taskService.addTask(this, 5000);
    this.eventService = frameworkService.getService("EventService");
    this.chainInfoService = frameworkService.getService("ChainInfoService");
  }

  async loadTradeTask(taskArray) {
    this.taskArray = taskArray;
  }

  async runTask(taskPara) {
    let storageService = this.frameworkService.getService("StorageService");
    let length = this.taskArray.length;
    for (let idx = 0; idx < length; ++idx) {
      let index = length - idx - 1;
      let obj = this.taskArray[index];
      if (obj.checkTime) {
        let now = parseInt(Date.now() / 1000);
        if ((now - obj.checkTime) >= obj.interval) {
          obj.checkTime = now;
        } else {
          continue; // wait next schedule and do not need to save
        }
      }
      try {
        let result = await this.checkReceipt(obj);
        if ((!result) && obj.txCheckInfo) {
          result = await this.checkEvent(obj);
        }
        console.debug("%s %s CheckTxReceiptService result: %O", obj.chain, obj.txHash, result);
        if (result) {
          if (result.txHash && (obj.txHash !== result.txHash)) { // update txHash: evm repriced
            console.log("task %s %s update txHash %s to %s", obj.ccTaskId, obj.chain, obj.txHash, result.txHash);
            obj.txHash = result.txHash;
            if (obj.convertCheckInfo) {
              obj.convertCheckInfo.uniqueID = "0x" + tool.hexStrip0x(result.txHash);
            }
          }
          if (result.result === "Succeeded") {
            await this.addToScEventScan(obj);
          }
          await this.finishTask(index, obj, result.result, result.errInfo);
          continue; // task would be deleted, do not need to save, process next job
        }
      } catch (err) {
        console.error("%s %s CheckTxReceiptService error: %O", obj.chain, obj.txHash, err);
      }
      await storageService.save("CheckTxReceiptService", obj.ccTaskId, obj);
    }
  }

  async checkReceipt(obj) {
    try {
      let txReceipt = await this.chainInfoService.getTransactionReceipt(obj.chain, obj.txHash);
      if (txReceipt) {
        let result = "Failed";
        let errInfo = "Transaction failed";
        let isSuccess = (txReceipt.status == 1);
        if (isSuccess) {
          result = "Succeeded";
          errInfo = "";
        }
        return { result, errInfo };
      } else {
        return null;
      }
    } catch (err) { // not finish
      // console.error("%s %s checkReceipt error: %O", obj.chain, obj.txHash, err);
      return null;
    }
  }

  async checkEvent(obj) {
    let txCheckInfo = obj.txCheckInfo;
    if (txCheckInfo.nonce === undefined) { // save nonce at first run
      let txInfo = await this.chainInfoService.getTxInfo(obj.chain, obj.txHash);
      console.debug("task %s %s get txInfo: %O", obj.ccTaskId, obj.chain, txInfo);
      if (txInfo) {
        txCheckInfo.input = txInfo.input;
        txCheckInfo.nonce = txInfo.nonce;
      } else { // not broadcast yet, or has been replaced before task run
        return null;
      }
    }
    let latestBlock = await this.chainInfoService.getBlockNumber(obj.chain);
    let fromBlock = txCheckInfo.fromBlock;
    if (latestBlock >= fromBlock) {
      let scanBatchSize = CustomizedScanBatchSize[obj.chain] || DefaultScanBatchSize;
      let rewindBlocks = parseInt(scanBatchSize * 0.6);
      let toBlock = fromBlock + scanBatchSize - 1;
      if (toBlock > latestBlock) {
        toBlock = latestBlock;
      }
      // rewind on recent tx
      if ((toBlock + scanBatchSize) > latestBlock) {
        fromBlock = fromBlock - rewindBlocks; // rewind default
        if (fromBlock < 1) {
          fromBlock = 1;
        }
        toBlock = fromBlock + scanBatchSize - 1;
        if (toBlock > latestBlock) { // rewind max
          toBlock = latestBlock;
          fromBlock = toBlock - scanBatchSize + 1;
          if (fromBlock < 1) {
            fromBlock = 1;
          }
        }
      }
      console.debug("task %s %s check tx %s minted: block %d-%d/%d", obj.ccTaskId, obj.chain, obj.txHash, fromBlock, toBlock, latestBlock);
      let chainInfo = this.chainInfoService.getChainInfoByType(obj.chain);
      let eventEmitter = txCheckInfo.eventSc || txCheckInfo.to;
      let events = await this.chainInfoService.getScEvent(obj.chain, eventEmitter, txCheckInfo.topics, { fromBlock, toBlock });
      if (events.length) {
        for (let log of events) {
          // console.debug("checkEvent log: %O", log);
          let txInfo = await this.chainInfoService.getTxInfo(obj.chain, log.transactionHash);
          if ((txInfo.nonce === txCheckInfo.nonce) && tool.cmpAddress(txInfo.from, txCheckInfo.from)) {
            if (tool.cmpAddress(txInfo.to, txCheckInfo.to) && (txInfo.input === txCheckInfo.input)) {
              return { result: "Succeeded", errInfo: "", txHash: log.transactionHash }; // normal or repriced
            }
          }
        }
      }
      if (txCheckInfo.nonceBlock) {
        if (toBlock > (txCheckInfo.nonceBlock + 10)) {
          console.debug("task %s %s tx %s is replaced or canceled", obj.ccTaskId, obj.chain, obj.txHash);
          return { result: "Failed", errInfo: "Transaction failed" };
        }
      } else {
        let curNonce = await this.chainInfoService.getNonce(obj.chain, txCheckInfo.from);
        if (curNonce > txCheckInfo.nonce) {
          txCheckInfo.nonceBlock = latestBlock;
        }
      }
      txCheckInfo.fromBlock = toBlock + 1;
    } else { // rollback
      txCheckInfo.fromBlock = latestBlock;
      txCheckInfo.nonceBlock = 0;
      console.debug("task %s %s check tx %s minted no new block %d/%d", obj.ccTaskId, obj.chain, obj.txHash, fromBlock, latestBlock);
    }
    return null;
  }

  async addToScEventScan(obj) {
    if (obj.convertCheckInfo) {
      if (!obj.convertCheckInfo.fromChain) {
        obj.convertCheckInfo.fromChain = obj.chain;
      }
      let scEventScanService = this.frameworkService.getService("ScEventScanService");
      await scEventScanService.add(obj.convertCheckInfo);
    }
  }

  async add(obj) {
    let storageService = this.frameworkService.getService("StorageService");
    if (obj.interval) { // check interval in second, some chains such as Bitcoin do not need check frequently
      obj.checkTime = parseInt(Date.now() / 1000); // last checktime in second
    }
    await storageService.save("CheckTxReceiptService", obj.ccTaskId, obj);
    this.taskArray.push(obj);
  }

  async finishTask(taskIndex, task, result, errInfo) {
    await this.eventService.emitEvent(task.event || "TaskStepResult", {
      ccTaskId: task.ccTaskId,
      stepIndex: task.stepIndex,
      txHash: task.txHash,
      result,
      errInfo
    });
    let storageService = this.frameworkService.getService("StorageService");
    await storageService.delete("CheckTxReceiptService", task.ccTaskId);
    this.taskArray.splice(taskIndex, 1);
  }
}

export default CheckTxReceiptService;
