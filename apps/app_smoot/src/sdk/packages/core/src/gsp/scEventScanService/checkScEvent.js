import tool from "../../utils/tool.js";

const DefaultScanBatchSize = 1000;

const CustomizedScanBatchSize = {
  ETH: 500,
  MATIC: 100,
};

const EvmEventTypes = ["smootReceive"];

class CheckScEvent {
  constructor(frameworkService) {
    this.frameworkService = frameworkService;
    this.eventHandler = new Map();
    this.eventTasks = new Map();
  }

  async init(chainInfo) {
    this.chainInfo = chainInfo;
    this.scanBatchSize = CustomizedScanBatchSize[chainInfo.chainType] || DefaultScanBatchSize;
    this.chainInfoService = this.frameworkService.getService("ChainInfoService");
    this.taskService = this.frameworkService.getService("TaskService");
    this.taskService.addTask(this, this.chainInfo.txScanInterval);
    this.eventService = this.frameworkService.getService("EventService");
    this.configService = this.frameworkService.getService("ConfigService");
    this.storemanService = this.frameworkService.getService("StoremanService");
    this.smootGatewayAbi = this.configService.getAbi("smootGateway");
    this.eventTypes = EvmEventTypes;
    this.eventHandler.set("smootReceive", this.processSmootReceive.bind(this));
    this.eventTypes.forEach(v => this.eventTasks.set(v, []));
  }

  async add(task) {
    //console.log("CheckScEvent task: %O", task);
    let tasks = this.eventTasks.get(task.taskType);
    if (tasks) {
      tasks.unshift(task);
    }
  }

  async load(task) {
    await this.add(task);
  }

  async runTask(taskPara) {
    try {
      for (let v of this.eventTypes) {
        let fn = this.eventHandler.get(v);
        if (fn) {
          await fn();
        } else {
          console.error("CheckScEvent unsupported event type: %s", v);
        }
      }
    } catch (err) {
      console.error("%s checkScEvent error: %O", this.chainInfo.chainType, err);
    }
  }

  async processSmootReceive() {
    let eventHash = this.getEventHash(this.smootGatewayAbi, "InboundTaskExecuted");
    let eventName = "InboundTaskExecuted";
    await this.processScLogger("smootReceive", eventHash, eventName);
  }

  getEventHash(abi, eventName) {
    let prototype = "";
    for (let i = 0; i < abi.length; ++i) {
      let item = abi[i];
      if (item.name == eventName) {
        prototype = eventName + '(';
        for (let j = 0; j < item.inputs.length; ++j) {
          if (j != 0) {
            prototype = prototype + ',';
          }
          prototype = prototype + item.inputs[j].type;
        }
        prototype = prototype + ')';
        break;
      }
    }
    return tool.sha3(prototype);
  }

  async processScLogger(type, eventHash, eventName) {
    let tasks = this.eventTasks.get(type);
    let count = tasks.length;
    if (count === 0) {
      return;
    }
    let latestBlockNumber = await this.storemanService.getChainBlockNumber(this.chainInfo.chainType);
    if (latestBlockNumber === 0) { // failed
      console.error("%s CheckScEvent %s get latest block number error", this.chainInfo.chainType, type);
      return;
    }
    let storageService = this.frameworkService.getService("StorageService");
    for (let i = 0; i < count; i++) {
      let cur = count - i - 1; // backwards
      let task = tasks[cur];
      try {
        if (task.fromBlockNumber == 0) { // retry get block number firstly
          let delay = parseInt((Date.now() - task.ccTaskId) / 1000);
          let blockNumber = latestBlockNumber - delay;
          console.log("%s CheckScEvent task %d %s retry blockNumber %d(+%d)", this.chainInfo.chainType, task.ccTaskId, type, blockNumber, delay);
          if (blockNumber < 0) {
            blockNumber = 1;
          }
          task.fromBlockNumber = blockNumber;
        }
        if ((task.taskType === "smootReceive") && ((task.wmbTaskId === "") || !task.wmbGateway)) {
          let [wmbTaskId, gateway] = await Promise.all([
            this.storemanService.parseSmootWmbTaskId(task.fromChain, task.txHash),
            this.getSmootGatewayAddr(task.smootSc)
          ]);
          if (wmbTaskId && gateway) {
            task.wmbTaskId = wmbTaskId;
            task.wmbGateway = gateway;
          } else { // throw error to save task
            throw new Error(this.chainInfo.chainType + " CheckScEvent task " + task.ccTaskId + " parseSmootWmbTaskId error");
          }
        }
        let fromBlockNumber = task.fromBlockNumber;
        if (latestBlockNumber >= fromBlockNumber) {
          let rewindBlocks = parseInt(this.scanBatchSize * 0.6);
          let toBlockNumber = fromBlockNumber + this.scanBatchSize - 1;
          if (toBlockNumber > latestBlockNumber) {
            toBlockNumber = latestBlockNumber;
          }
          // rewind on recent tx
          if ((toBlockNumber + this.scanBatchSize) > latestBlockNumber) {
            fromBlockNumber = fromBlockNumber - rewindBlocks; // rewind default
            if (fromBlockNumber < 1) {
              fromBlockNumber = 1;
            }
            toBlockNumber = fromBlockNumber + this.scanBatchSize - 1;
            if (toBlockNumber > latestBlockNumber) { // rewind max
              toBlockNumber = latestBlockNumber;
              fromBlockNumber = toBlockNumber - this.scanBatchSize + 1;
              if (fromBlockNumber < 1) {
                fromBlockNumber = 1;
              }
            }
          }
          let event;
          if (task.taskType === "smootReceive") {
            let topics = [eventHash, task.wmbTaskId];
            event = await this.scanSmootEvent(fromBlockNumber, toBlockNumber, task.wmbGateway, topics);
          }
          if (event) {
            await this.updateUIAndStorage(task, event.txHash, event.toAccount, event.value);
            tasks.splice(cur, 1);
            continue; // task would be deleted, do not need to save, process next job
          } else { // wait next scan
            task.fromBlockNumber = toBlockNumber + 1;
          }
          console.debug("%s CheckScEvent block %d-%d/%d %s: taskId=%s, uniqueId=%s",
            this.chainInfo.chainType, fromBlockNumber, toBlockNumber, latestBlockNumber, type, task.ccTaskId, task.uniqueID);
        } else { // rollback
          task.fromBlockNumber = latestBlockNumber;
          console.debug("%s CheckScEvent no new block %d/%d %s: taskId=%s, uniqueId=%s",
            this.chainInfo.chainType, fromBlockNumber, latestBlockNumber, type, task.ccTaskId, task.uniqueID);
        }
      } catch (err) {
        if (err.message === "log is not ready") {
          console.debug("%s CheckScEvent fromBlock %d %s %O error: %s", this.chainInfo.chainType, task.fromBlockNumber, type, task, err.message);
        } else {
          console.error("%s CheckScEvent fromBlock %d %s %O error: %O", this.chainInfo.chainType, task.fromBlockNumber, type, task, err);
        }
      }
      await storageService.save("ScEventScanService", task.uniqueID, task); // always save regardless of exception
    }
  }

  async getSmootGatewayAddr(smootSc) {
    let abi = [{
      "inputs": [],
      "name": "wmbGateway",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }];
    let addr = await this.chainInfoService.callScFunc(this.chainInfo.chainType, smootSc, "wmbGateway", [], abi);
    console.debug("%s smoot receive wmbGateway addr: %s", this.chainInfo.chainType, addr);
    return addr;
  }

  async scanSmootEvent(fromBlockNumber, toBlockNumber, sc, topics) {
    let events = await this.chainInfoService.getScEvent(
      this.chainInfo.chainType,
      sc, // wmb gateway
      topics,
      {
        "fromBlock": fromBlockNumber,
        "toBlock": toBlockNumber
      }
    );
    if (events.length) {
      return { txHash: events[0].transactionHash }; // demo do not parse toAccount and value
    } else {
      return null;
    }
  }

  async updateUIAndStorage(task, txHash, toAccount, value) {
    this.eventService.emitEvent("RedeemTxHash", { ccTaskId: task.ccTaskId, txHash, toAccount, value: value || task.value });
    let storageService = this.frameworkService.getService("StorageService");
    await storageService.delete("ScEventScanService", task.uniqueID);
  }
}

export default CheckScEvent;
