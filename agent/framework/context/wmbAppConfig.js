/*
 * Copyright (c) 2019 Wanchain. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
"use strict"

/**
 * Configuration for WmbApp Associated Smart Contract Addresses
 * This file contains contract addresses that can identify a WmbApp across different chains
 */
const WmbAppLookupTable = {

    // Keys are dApp names, should match with the key used in setWmbAppConverter() inside the context's initialize.js
    "DemoTokenFromPoly2Eth" : [ // need to change to real WmbApp contract address
      "0xa68bC6f96B0F0f920d610877B85B6EeFeDb4bE95",     // (Erc3643 Token) TokenHome contract on Polygon
      "0x1c5E389A4C43397A03FF4cF00FC0FC781E100ede"      // (Erc3643 Token) TokenRemote contract on Eth
    ],
    "DemoTokenFromEth2Poly" : [ // need to change to real WmbApp contract address
      "0x5991A20A11A6bd359F428aA776506dF22615EFa1",     // (Erc3643 Token) TokenRemote contract on Polygon
      "0x398940dACa3b3Ab9c66f611ad596462f45397698"      // (Erc3643 Token) TokenHome contract on Eth
    ]

}

module.exports = {
  WmbAppLookupTable: WmbAppLookupTable
};