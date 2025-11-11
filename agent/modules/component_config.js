"use strict";

// Gateway level converter:
const MaticGateWayConverter = require('@modules/chain/evm/convert/index.js');

// DApp level converter:
const Matic_TokenCrossChainConverter = require('@modules/converter/TokenCrossChainDemo/evm/index.js');

// Agent/Chain/Relay classes
const EthAgentModel = require('@modules/chain/evm/EthAgentModel.js');
const EthBaseChain = require('@modules/chain/evm/ethBase.js');
const MultiSig = require('@modules/relay/multiSig');

function createEthAgentClass(chainType) {
  return class EthAgentModelTemp extends EthAgentModel {
    constructor(record = null) {
      super(record, chainType);
    }
  };
}

// Export { DAppName: { chainName: [converterObject, gw-app-address] } } format dictionary
const wmbAppConvertDict = {
  // DApp-first
  "DemoTokenFromPoly2Eth": {
    "MATIC": [ new Matic_TokenCrossChainConverter("MATIC"), "0x4edB9D4ba0042926946a842E8d2dbB37edc9C677" ],
    "ETH":   [ new Matic_TokenCrossChainConverter("ETH"),   "0xbBC41A516b735Ff86bC5565239B65c929C8944cD" ]
  },
};

// Export { chainName: gatewayConverterObject } format dictionary
const wmbGateConvertDict = {
  "MATIC": new MaticGateWayConverter("MATIC"),
  "ETH": new MaticGateWayConverter("ETH")
};

// Export { chainName: class } for agent classes
const agentClassDict = {
  "MATIC": createEthAgentClass("MATIC"),
  "ETH": createEthAgentClass("ETH")
};

// Export { chainName: class } for chain classes
const chainClassDict = {
  "MATIC": EthBaseChain,
  "ETH": EthBaseChain
};

// Export { chainName: class } for relay classes
const relayClassDict = {
  "MATIC": MultiSig,
  "ETH": MultiSig
};

module.exports = { wmbAppConvertDict, wmbGateConvertDict, agentClassDict, chainClassDict, relayClassDict };