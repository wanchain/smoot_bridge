/*
 * Copyright (c) 2019 Wanchain. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
"use strict"

const context = require("./index.js");

const ksTool = require("../utils/keyStore");

const EthBaseChain = require("@modules/chain/evm/ethBase.js");
// const StellarChain = require("@modules/chain/stellar/stellar.js");

const MultiSig = require('@modules/relay/multiSig');
const EthAgentModel = require("@modules/chain/evm/EthAgentModel.js");
// const StellarAgent = require("@modules/chain/stellar/StellarAgent.js")

const MaticGateWayConverter = require('@modules/chain/evm/convert/index.js')

const Matic_TokenCrossChainConverter  = require('@modules/converter/TokenCrossChainDemo/evm/index.js');

// Import WmbApp configuration from standalone config file
const { WmbAppLookupTable } = require('./wmbAppConfig.js');


const WmbConverterManager = require("./WmbConverterManager.js")

const wmbConverterManager = new WmbConverterManager(WmbAppLookupTable);

wmbConverterManager.setWmbGateConverter("MATIC", new MaticGateWayConverter("MATIC"));
wmbConverterManager.setWmbGateConverter("ETH", new MaticGateWayConverter("ETH"));

// DApp-first:
wmbConverterManager.setWmbAppConverter("MATIC", "DemoTokenFromPoly2Eth", new Matic_TokenCrossChainConverter("MATIC"));
wmbConverterManager.setWmbAppConverter("ETH", "DemoTokenFromPoly2Eth", new Matic_TokenCrossChainConverter("ETH"));

// DApp-second:
wmbConverterManager.setWmbAppConverter("MATIC", "DemoTokenFromEth2Poly", new Matic_TokenCrossChainConverter("MATIC"));
wmbConverterManager.setWmbAppConverter("ETH", "DemoTokenFromEth2Poly", new Matic_TokenCrossChainConverter("ETH"));

// exports.convertDict = convertDict;
global.wmbConverterMgr = wmbConverterManager;

const privateKey = ksTool.getPrivateKey(global.agentAddr, global.secret["WORKING_PWD"]);
context.setPrivateKey(privateKey);

function creatEthAgentFork(chainType) {
  class EthAgentModelTemp extends EthAgentModel {
    constructor(record = null) {
      super(record, chainType);
    }
  }
  return EthAgentModelTemp;
}

// const agentDict = {
//   MATIC: creatEthAgentFork('MATIC'),
//   XLM: StellarAgent,
// };

context.setAgentClass("MATIC", creatEthAgentFork('MATIC'));
context.setAgentClass("ETH", creatEthAgentFork('ETH'));
// context.setAgentClass("XLM", StellarAgent);

context.setChainClass("MATIC", EthBaseChain);
context.setChainClass("ETH", EthBaseChain);
// context.setChainClass("XLM", StellarChain);

context.setRelayClass("MATIC", MultiSig);
context.setRelayClass("ETH", MultiSig);
// context.setRelayClass("XLM", MultiSig);

