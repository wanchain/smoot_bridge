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
          "0x714cd4B6B1182a258e4Ef1FD2Ddb82139ddB5830",     // App On Polygon
          "0x921206E6CE32BdC72aa7d5760E33CF8422EC408c"      // App On Eth
    ],
    "DemoTokenFromEth2Poly" : [ // need to change to real WmbApp contract address
      "0xeB4f99DA7cD6C47D4a7adaf14851ecd2B98B9919",     // App On Polygon
      "0x5D82f2cF40c283a36B87fad94e1072F5bb62cf6a"      // App On Eth
    ]

}

module.exports = {
  WmbAppLookupTable: WmbAppLookupTable
};