import BigNumber from "bignumber.js";
import Web3 from "web3";

const web3 = new Web3();

class TxGeneratorService {
  constructor() {
  }

  async init(frameworkService) {
    this.frameworkService = frameworkService;
    this.chainInfoService = frameworkService.getService("ChainInfoService");
    this.configService = frameworkService.getService("ConfigService");
  }

  // erc20 approve
  // event: Approval(address indexed owner, address indexed spender, uint256 value)
  // topic[0]: 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
  async generatorErc20ApproveData(tokenAddress, spenderAddress, value, options = {}) {
    value = "0x" + new BigNumber(value).toString(16);
    let abi = this.configService.getAbi("erc20");
    tokenAddress = tokenAddress.toLowerCase();
    let erc20Inst = new web3.eth.Contract(abi, tokenAddress);
    let data = erc20Inst.methods.approve(spenderAddress.toLowerCase(), value).encodeABI();
    let gasLimit = await this.chainInfoService.estimateGas(options.chainType, { from: options.from.toLowerCase(), to: tokenAddress, value: '0x00', data });
    console.debug("%s generatorErc20ApproveData gasLimit: %s", options.chainType, gasLimit);
    return { data, gasLimit };
  }

  async generateTx(chainType, gasLimit, toAddress, value, data, from) {
    let rawTx = {
      gas: "0x" + new BigNumber(new BigNumber(gasLimit).times(1.1).toFixed(0)).toString(16),
      to: toAddress.toLowerCase(),
      value: "0x" + new BigNumber(value || 0).toString(16),
      data,
      from: from.toLowerCase()
      // chainId
    };
    console.debug("%s generateTx gasLimit: %s", chainType, Number(rawTx.gas).toFixed());
    // console.debug("generateTx: %O", rawTx);
    return rawTx;
  }

  // event: OutboundTaskExecuted(bytes32 indexed taskId, uint256 indexed networkId, bytes contractAddress, bytes functionCallData)
  // topic[0]: 0x9f7186752cdee7e5cd6934f66fd3f1fed9b13406486ad5196ce0d20d6db81579
  async generateSmootBridgeSend(crossScAddr, chainId, value, tokenAccount, userAccount, options) {
    let abi = this.configService.getAbi("smootHome");
    let scAddr = crossScAddr.toLowerCase();
    let crossScInst = new web3.eth.Contract(abi, scAddr);
    value = "0x" + new BigNumber(value).toString(16);
    let data = crossScInst.methods.send(userAccount, value).encodeABI();
    let txValue = "0x" + new BigNumber(options.coinValue || 0).toString(16);
    let gasLimit = await this.chainInfoService.estimateGas(options.chainType, {from: options.from.toLowerCase(), to: scAddr, value: txValue, data});
    console.debug("%s generateSmootBridgeSend gasLimit: %s", options.chainType, gasLimit);
    return {data, gasLimit};
  }
}

export default TxGeneratorService;
