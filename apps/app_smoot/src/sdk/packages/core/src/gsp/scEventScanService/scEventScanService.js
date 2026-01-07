import CheckScEvent from "./checkScEvent.js";

class ScEventScanService {
  constructor() {
  }

  async init(frameworkService) {
    this.frameworkService = frameworkService;
    this.configService = frameworkService.getService("ConfigService");
    this.chainInfoService = frameworkService.getService("ChainInfoService");
    this.mapCheckHandle = new Map();
    // evm event add similar chains
    let eventChains = this.configService.getGlobalConfig("StoremanService");
    for (let chain of eventChains) {
      let checkScEvent = new CheckScEvent(frameworkService);
      checkScEvent.init(chain);
      this.mapCheckHandle.set(chain.chainType, checkScEvent);
    }
  }

  async loadTradeTask(tasks) {
    try {
      for (let task of tasks) {
        await this.load(task);
      }
    } catch (err) {
      console.log("ScEventScanService loadTradeTask error: %O", err);
    }
  }

  async add(task) {
    //console.log("scEventScanService add task: %O", task);
    let storageService = this.frameworkService.getService("StorageService");
    await storageService.save("ScEventScanService", task.uniqueID, task);
    let handle = this.mapCheckHandle.get(task.chain);
    if (handle) {
      await handle.add(task);
    }
  }
  async load(task) {
    // console.log("scEventScanService load task: %O", task);
    let handle = this.mapCheckHandle.get(task.chain);
    if (handle) {
      await handle.load(task);
    } else {
      console.error("ScEventScan for %s unavailable", task.chain);
    }
  }
}

export default ScEventScanService;
