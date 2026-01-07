import BigNumber from "bignumber.js";
import tool from "../../utils/tool.js";
import TokenHandler from "./tokenHandler.js";

export default (class SmootBridgeDeposit extends TokenHandler {
  constructor(frameworkService) {
    super(frameworkService);
  }

  async process(tokenPair, convert) {
    let steps = [];
    let isNativeToken = (convert.convertType === "MINT") ? tokenPair.fromIsNative : tokenPair.toIsNative;
    if (isNativeToken) { // skip mapping token
      await this.buildApproveSteps(steps, tokenPair, convert);
    }
    await this.buildDeposit(steps, tokenPair, convert);
    await this.setChainId(steps, tokenPair, convert);
    //console.log("SmootBridgeDeposit steps: %O", steps);
    return steps;
  }

  async buildDeposit(steps, tokenPair, convert) {
    let direction = (convert.convertType === "MINT");
    let chainInfo = direction ? tokenPair.fromScInfo : tokenPair.toScInfo;
    let decimals = direction ? tokenPair.fromDecimals : tokenPair.toDecimals;
    let tokenAccount = direction ? tokenPair.fromAccount : tokenPair.toAccount;
    let toChainType = direction ? tokenPair.toChainType : tokenPair.fromChainType;
    let value = new BigNumber(convert.value).multipliedBy(Math.pow(10, decimals));
    let unit = this.chainInfoService.getCoinSymbol(chainInfo.chainType);
    let networkFee = tool.parseFee(convert.fee, convert.value, unit, { formatWithDecimals: false });
    let operateFee = tool.parseFee(convert.fee, convert.value, tokenPair.readableSymbol, { formatWithDecimals: false, roundingMode: BigNumber.ROUND_UP });
    let params = {
      ccTaskId: convert.ccTaskId,
      fromAddr: convert.fromAddr,
      scChainType: chainInfo.chainType,
      crossScAddr: chainInfo.SmootBridge.crossScAddr, // lock and burn use independent contract, but each chain only support lock or burn, so still only need to config one contract now
      tokenPairID: convert.tokenPairId,
      value,
      userAccount: tool.getStandardAddressInfo(toChainType, convert.toAddr, this.configService.getExtension(toChainType)).evm,
      toAddr: convert.toAddr, // for readability
      taskType: "ProcessSmootBridgeDeposit",
      networkFee,
      tokenAccount,
      operateFee
    };
    console.debug("SmootBridgeDeposit build params: %O", params);
    steps.push({ name: "smootSend", stepIndex: steps.length + 1, params });
  }
});
