import tool from "../../utils/tool.js";
import ProcessBase from "./processBase.js";

export default (class ProcessSmootBridgeDeposit extends ProcessBase {
  constructor(frameworkService) {
    super(frameworkService);
    this.frameworkService = frameworkService;
    this.storemanService = frameworkService.getService("StoremanService");
  }

  async process(stepData, wallet) {
    let params = stepData.params;
    try {
      if (!(await this.checkChainId(stepData, wallet))) {
        return;
      }
      let tokenPair = this.m_tokenPairService.getTokenPair(params.tokenPairID);
      let toChainInfo = (params.scChainType === tokenPair.fromChainType) ? tokenPair.toScInfo : tokenPair.fromScInfo;
      let options = { chainType: params.scChainType, from: params.fromAddr, coinValue: params.networkFee, operateFee: params.operateFee };
      let scData = await this.m_txGeneratorService.generateSmootBridgeSend(params.crossScAddr, toChainInfo.chainId, params.value, params.tokenAccount, params.userAccount, options);
      let txData = await this.m_txGeneratorService.generateTx(params.scChainType, scData.gasLimit, params.crossScAddr, params.networkFee, scData.data, params.fromAddr);
      await this.sendTransactionData(stepData, txData, wallet);
    } catch (err) {
      console.error("ProcessSmootBridgeDeposit error: %O", err);
      this.m_WebStores["crossChainTaskRecords"].finishTaskStep(params.ccTaskId, stepData.stepIndex, "", "Failed", tool.getErrMsg(err, "Failed to send transaction"));
    }
  }

  // virtual function

  async getConvertInfoForCheck(stepData) {
    let params = stepData.params;
    let tokenPair = this.m_tokenPairService.getTokenPair(params.tokenPairID);
    let direction = (params.scChainType === tokenPair.fromChainType);
    let toChainInfo = direction ? tokenPair.toScInfo : tokenPair.fromScInfo;
    let storemanService = this.frameworkService.getService("StoremanService");
    let blockNumber = await storemanService.getChainBlockNumber(toChainInfo.chainType, { bridge: "Smoot" });
    let configService = this.frameworkService.getService("ConfigService");
    let smootAbi = configService.getAbi("smootHome");
    let chainInfoService = this.frameworkService.getService("ChainInfoService");
    let wmbGateway = await chainInfoService.callScFunc(params.scChainType, params.crossScAddr, "wmbGateway", [], smootAbi);
    console.log("ProcessSmootBridgeDeposit send wmbGateway: %s", wmbGateway);
    let txEventTopics = ["0x9f7186752cdee7e5cd6934f66fd3f1fed9b13406486ad5196ce0d20d6db81579"]; // old version OutboundTaskExecuted event of wmb gateway, not smoot dapp
    let convertCheckInfo = {
      ccTaskId: params.ccTaskId,
      txHash: stepData.txHash,
      uniqueID: "0x" + tool.hexStrip0x(stepData.txHash),
      chain: toChainInfo.chainType,
      fromBlockNumber: blockNumber,
      taskType: "smootReceive",
      fromChain: params.scChainType,
      smootSc: toChainInfo.SmootBridge.crossScAddr,
      wmbTaskId: "", // really uniqueID
    };
    return { eventSc: wmbGateway, txEventTopics, convertCheckInfo };
  }
});
