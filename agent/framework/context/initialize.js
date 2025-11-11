/*
 * Copyright (c) 2019 Wanchain. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
"use strict"

const context = require("./index.js");

const ksTool = require("../utils/keyStore");

const WmbConverterManager = require("./WmbConverterManager.js")


// import configuration dicts
const { wmbGateConvertDict, wmbAppConvertDict, agentClassDict, chainClassDict, relayClassDict } = require('@modules/component_config.js');

// Build WmbApp lookup table from component_config dapp dict
function buildWmbAppLookupTableFromConfig(dappConverterDict) {
  const table = {};
  Object.entries(dappConverterDict).forEach(([dAppName, chainMap]) => {
    const addresses = Object.values(chainMap).map(([converterObj, address]) => address);
    table[dAppName] = addresses;
  });
  return table;
}

const wmbAppLookupTable = buildWmbAppLookupTableFromConfig(wmbAppConvertDict);
const wmbConverterManager = new WmbConverterManager(wmbAppLookupTable);

// register gateway level converters from dict
Object.entries(wmbGateConvertDict).forEach(([chainName, gatewayConverterObj]) => {
  wmbConverterManager.setWmbGateConverter(chainName, gatewayConverterObj);
});

// register dapp level converters from dict
Object.entries(wmbAppConvertDict).forEach(([dAppName, chainMap]) => {
  Object.entries(chainMap).forEach(([chainName, value]) => {
    const [dappConverterObj] = value;
    wmbConverterManager.setWmbAppConverter(chainName, dAppName, dappConverterObj);
  });
});

// exports.convertDict = convertDict;
global.wmbConverterMgr = wmbConverterManager;

const privateKey = ksTool.getPrivateKey(global.agentAddr, global.secret["WORKING_PWD"]);
context.setPrivateKey(privateKey);

// register agent classes from dict
Object.entries(agentClassDict).forEach(([chainName, AgentClass]) => {
  context.setAgentClass(chainName, AgentClass);
});

// register chain classes from dict
Object.entries(chainClassDict).forEach(([chainName, ChainClass]) => {
  context.setChainClass(chainName, ChainClass);
});

// register relay classes from dict
Object.entries(relayClassDict).forEach(([chainName, RelayClass]) => {
  context.setRelayClass(chainName, RelayClass);
});

