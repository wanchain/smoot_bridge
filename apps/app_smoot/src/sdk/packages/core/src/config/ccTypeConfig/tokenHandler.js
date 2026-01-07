import BigNumber from "bignumber.js";

class TokenHandler {
  constructor(frameworkService) {
    this.frameworkService = frameworkService;
    this.configService = frameworkService.getService("ConfigService");
    this.chainInfoService = frameworkService.getService("ChainInfoService");
  }

  async process(tokenPair, convert) {
    console.error("Unimplemented interface");
    return {
      stepNum: 0,
      errCode: "Unknown error"
    };
  }

  async buildApproveSteps(steps, tokenPair, convert) {
    // defalut Erc20
    return this.buildErc20Approve(steps, tokenPair, convert);
  }

  async buildErc20Approve(steps, tokenPair, convert) {
    let chainInfo = (convert.convertType === "MINT") ? tokenPair.fromScInfo : tokenPair.toScInfo;
    let tokenSc = (convert.convertType === "MINT") ? tokenPair.fromAccount : tokenPair.toAccount;
    let decimals = (convert.convertType === "MINT") ? tokenPair.fromDecimals : tokenPair.toDecimals;
    let approveMaxValue = "115792089237316195423570985008687907853269984665640564039457584007913129639935"; // max;
    let crossScAddr = "";
    if (tokenPair.bridge) {
      let bridgeInfo = chainInfo[tokenPair.bridge + "Bridge"];
      crossScAddr = bridgeInfo.crossScAddr;
    } else {
      crossScAddr = chainInfo.crossScAddr;
    }
    let approveParams = {
      ccTaskId: convert.ccTaskId,
      fromAddr: convert.fromAddr,
      scChainType: chainInfo.chainType,
      erc20Addr: tokenSc,
      value: approveMaxValue,
      spenderAddr: crossScAddr,
      taskType: "ProcessErc20Approve"
    };
    console.debug("TokenHandler buildErc20Approve %s params: %O", convert.convertType, approveParams);
    let allowance = await this.chainInfoService.getErc20Allowance(chainInfo.chainType,
      tokenSc,
      convert.fromAddr,
      crossScAddr);
    allowance = new BigNumber(allowance);
    console.debug("%s token %s allowance %s(%s->%s)", chainInfo.chainType, tokenSc, allowance.toFixed(), convert.fromAddr, crossScAddr);
    if (allowance.isGreaterThan(0)) {
      let value = new BigNumber(convert.value).multipliedBy(Math.pow(10, decimals));
      if (allowance.isLessThan(value)) {
        // approve 0
        let approve0Params = Object.assign({}, approveParams);
        approve0Params.value = new BigNumber(0);
        steps.push({ name: "erc20Approve0", stepIndex: steps.length + 1, params: approve0Params });
        // approve
        steps.push({ name: "erc20Approve", stepIndex: steps.length + 1, params: approveParams });
      }
    } else {
      steps.push({ name: "erc20Approve", stepIndex: steps.length + 1, params: approveParams });
    }
  }

  async setChainId(steps, tokenPair, convert) {
    let chainId = await convert.wallet.getChainId();
    for (let i = 0; i < steps.length; i++) {
      steps[i].params.chainId = chainId;
    }
  }
}

export default TokenHandler;
