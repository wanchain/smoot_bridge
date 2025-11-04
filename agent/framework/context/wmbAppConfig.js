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
          "0x8E529447Ee1B06898949f03373720F469537a641",     // App On Polygon
          "0x81a1c9aeA719603B3Adc01DF87F8345bb4a26F04"      // App On Eth
    ],
    "DemoTokenFromEth2Poly" : [ // need to change to real WmbApp contract address
      "0x31921dA87447d10426C1e3cdE85fc7909BEeBAf0",     // App On Polygon
      "0xD31D726F8AdA3E14f5fb37aa99D7E4883FC5F404"      // App On Eth
    ]

}

module.exports = {
  WmbAppLookupTable: WmbAppLookupTable
};