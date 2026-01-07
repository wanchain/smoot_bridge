import BigNumber from "bignumber.js";

class crossChainFees {
  async init(frameworkService) {
    this.tokenPairService = frameworkService.getService("TokenPairService");
    this.chainInfoService = frameworkService.getService("ChainInfoService");
  }

  async estimateOperationFee(tokenPairId, fromChainType, toChainType, options) { // agent fee
    let tokenPair = this.tokenPairService.getTokenPair(tokenPairId);
    let decimals = (fromChainType === tokenPair.fromScInfo.chainType) ? tokenPair.fromDecimals : tokenPair.toDecimals;
    let fee = {value: "0", isPercent: false};
    // console.debug("estimateOperationFee %s->%s raw: %O", fromChainType, toChainType, fee);
    let feeBN = new BigNumber(fee.value);
    return {
      fee: fee.isPercent ? feeBN.toFixed() : feeBN.div(Math.pow(10, decimals)).toFixed(),
      isRatio: fee.isPercent,
      unit: tokenPair.readableSymbol,
      min: new BigNumber(fee.minFeeLimit || "0").div(Math.pow(10, decimals)).toFixed(),
      max: new BigNumber(fee.maxFeeLimit || "0").div(Math.pow(10, decimals)).toFixed(),
      decimals: Number(decimals),
      discount: fee.discountPercent || "1"
    };
  }

  async estimateNetworkFee(tokenPairId, fromChainType, toChainType, options) { // contract fee
    let tokenPair = this.tokenPairService.getTokenPair(tokenPairId);
    let direction = (fromChainType === tokenPair.fromScInfo.chainType);
    let srcChainInfo = direction ? tokenPair.fromScInfo : tokenPair.toScInfo;
    let decimals = srcChainInfo.chainDecimals;
    let fee = {value: "0", isPercent: false};
    // console.debug("estimateNetworkFee %s->%s raw: %O", fromChainType, toChainType, fee);
    let feeBN = new BigNumber(fee.value);
    let unit = this.chainInfoService.getCoinSymbol(fromChainType);
    return {
      fee: fee.isPercent ? feeBN.toFixed() : feeBN.div(Math.pow(10, decimals)).toFixed(),
      isRatio: fee.isPercent,
      unit,
      min: new BigNumber(fee.minFeeLimit || "0").div(Math.pow(10, decimals)).toFixed(),
      max: new BigNumber(fee.maxFeeLimit || "0").div(Math.pow(10, decimals)).toFixed(),
      decimals: Number(decimals),
      discount: fee.discountPercent || "1"
    };
  }
}

export default crossChainFees;
