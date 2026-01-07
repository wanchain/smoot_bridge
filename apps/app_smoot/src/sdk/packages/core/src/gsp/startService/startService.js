import FrameworkService from "../frameworkService/FrameworkService.js";
import EventService from "../eventService/EventService.js";
import ConfigService from "../configService/configService.js";
import StorageService from "../storageService/storageService.js";
import TaskService from "../taskService/TaskService.js";
import StoremanService from "../storemanService/StoremanService.js";
import TxGeneratorService from "../txGeneratorService/TxGeneratorService.js";
import CheckTxReceiptService from "../checkTxReceiptService/checkTxReceiptService.js";
import ScEventScanService from "../scEventScanService/scEventScanService.js";
import CrossChainFeesService from "../crossChainFeesService/crossChainFees.js";
import CCTHandleService from "../CCTHandleService/CCTHandleService.js";
import TxTaskHandleService from "../txTaskHandleService/txTaskHandleService.js";
import TokenPairService from "../tokenPairService/tokenPairService.js";
import ChainInfoService from "../chainInfoService/chainInfoService.js";

class StartService {
  constructor() {
    this.frameworkService = new FrameworkService();
  }

  async onStoremanServiceInitComplete(args) {
    this.m_eventService.emitEvent("ReadStoremanInfoComplete", args);
    //console.log("StartService onStoremanServiceInitComplete args: ", args);
  }

  async init(network, stores, options) {
    try {
      let frameworkService = this.frameworkService;
      frameworkService.registerService("WebStores", stores);
      let eventService = new EventService();
      await eventService.init(frameworkService);
      frameworkService.registerService("EventService", eventService);
      eventService.addEventListener("StoremanServiceInitComplete", this.onStoremanServiceInitComplete.bind(this));
      this.m_eventService = eventService;
      let configService = new ConfigService();
      await configService.init(network, options);
      frameworkService.registerService("ConfigService", configService);
      let chainInfoService = new ChainInfoService();
      await chainInfoService.init(frameworkService);
      frameworkService.registerService("ChainInfoService", chainInfoService);
      let cctHandleService = new CCTHandleService();
      await cctHandleService.init(frameworkService);
      frameworkService.registerService("CCTHandleService", cctHandleService);
      let txTaskHandleService = new TxTaskHandleService();
      await txTaskHandleService.init(frameworkService);
      frameworkService.registerService("TxTaskHandleService", txTaskHandleService);
      let taskService = new TaskService();
      await taskService.init(frameworkService);
      frameworkService.registerService("TaskService", taskService);
      let storemanService = new StoremanService();
      await storemanService.init(frameworkService, options);
      frameworkService.registerService("StoremanService", storemanService);
      let tokenPairService = new TokenPairService();
      await tokenPairService.init(frameworkService, options);
      frameworkService.registerService("TokenPairService", tokenPairService);
      let txGeneratorService = new TxGeneratorService();
      await txGeneratorService.init(frameworkService);
      frameworkService.registerService("TxGeneratorService", txGeneratorService);
      let checkTxReceiptService = new CheckTxReceiptService();
      await checkTxReceiptService.init(frameworkService);
      frameworkService.registerService("CheckTxReceiptService", checkTxReceiptService);
      let scEventScanService = new ScEventScanService();
      await scEventScanService.init(frameworkService);
      frameworkService.registerService("ScEventScanService", scEventScanService);
      let storageService = new StorageService();
      await storageService.init(frameworkService);
      frameworkService.registerService("StorageService", storageService);
      let crossChainFeesService = new CrossChainFeesService();
      await crossChainFeesService.init(frameworkService);
      frameworkService.registerService("CrossChainFeesService", crossChainFeesService);
    } catch (err) {
      console.error("StartService init err:", err);
    }
  }

  async start() {
    try {
      let frameworkService = this.frameworkService;
      let storageService = frameworkService.getService("StorageService");
      await storageService.init_load();
      let tokenPairService = frameworkService.getService("TokenPairService");
      await tokenPairService.start();
    } catch (err) {
      console.error("startService start err:", err);
    }
  }

  getService(serviceName) {
    return this.frameworkService.getService(serviceName);
  }
}

export default StartService;
