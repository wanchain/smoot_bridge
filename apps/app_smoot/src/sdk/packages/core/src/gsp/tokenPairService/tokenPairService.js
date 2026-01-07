import { createHash } from 'crypto-browserify';
import Identicon from "identicon.js";
import tool from "../../utils/tool.js";

const ChainLogo = {
  ETH: { type: "png", data: "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" },
  MATIC: { type: "png", data: "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" }
};

const AssetLogo = {};

class TokenPairService {
  constructor() {
    this.m_mapTokenPair = new Map(); // tokenPairId => tokenPair
    this.storageService = null; // init after token pair service
    this.multiChainOrigToken = new Map();
    this.tokenIssuer = new Map();
    this.chainName2Type = new Map(); // internal use chainType and frontend use chainName
    this.fromChainAssets = new Map(); // protocol => chainType => assetName => tokenAccount
    this.tokenInfos = new Map(); // only for reward tasks, add tokens as needed
  }

  async init(frameworkService, options) {
    try {
      this.frameworkService = frameworkService;
      this.eventService = frameworkService.getService("EventService");
      this.configService = frameworkService.getService("ConfigService");
      this.chainInfoService = frameworkService.getService("ChainInfoService");
      this.webStores = frameworkService.getService("WebStores");
    } catch (err) {
      console.error("TokenPairService init error: %O", err);
    }
  }

  async start() {
    await this.readAssetPair();
  }

  async getSmgs(startTime) {
    return [];
  }

  async readAssetPair() {
    this.storageService = this.frameworkService.getService("StorageService");
    try {
      let ts0 = Date.now();
      let tokenPairMap = new Map();
      let [tokenPairs] = await Promise.all([
        this.readTokenpairs(ts0),
        this.readMultiChainOrigToken(ts0)
      ]);
      tokenPairs.forEach(tp => {
        this.updateTokenPairInfo(tp);
        tokenPairMap.set(tp.id, tp);
        return this.updateChainAssets(tp);
      })
      let ts1 = Date.now();
      let ps = [
        this.getSmgs(ts1)
      ];
      let [smgList] = await Promise.all(ps);
      let ts2 = Date.now();
      console.debug("readAssetPair consume %s/%s ms", ts2 - ts1, ts2 - ts0);
      // console.debug("available tokenPairMap: %O", tokenPairMap.values());
      this.webStores.assetPairs.setAssetPairs(tokenPairs, smgList, this.configService);
      this.m_mapTokenPair = tokenPairMap;
      this.eventService.emitEvent("StoremanServiceInitComplete", true);
    } catch (err) {
      console.error("readAssetPair error: %O", err);
      this.eventService.emitEvent("StoremanServiceInitComplete", false);
    }
  }

  async readTokenpairs(startTime) {
    let tokenPairs = [{
      id: '10001',
      ancestorChainID: '2147484614',
      fromChainID: '2147484614',
      toChainID: '2147483708',
      ancestorAccount: '0xe0447515899A2c17f6cA79454Ad23aBB45d2511A',
      fromAccount: '0xe0447515899A2c17f6cA79454Ad23aBB45d2511A',
      toAccount: '0x3ab51A08e69d661cC96379C637904b66e97328D7',
      ancestorName: 'SYMTN',
      ancestorSymbol: 'SYMTN',
      ancestorDecimals: '8',
      fromName: 'SYMTN',
      fromSymbol: 'SYMTN',
      fromDecimals: '8',
      name: 'SYMTN',
      symbol: 'SYMTN',
      decimals: '8',
      fromAccountType: 'Erc20',
      toAccountType: 'Erc20',
      fromAccountIsLayer2: false,
      toAccountIsLayer2: false,
      bridge: "Smoot"
    }];
    let ts = Date.now();
    console.debug("readTokenpairs %d consume %s ms", tokenPairs.length, ts - startTime);
    return tokenPairs;
  }

  async readMultiChainOrigToken(startTime) {
    let origTokens = [{ // smoot bridge test tokenpairs
      chainType: "MATIC", tokenScAddr: "0xe0447515899A2c17f6cA79454Ad23aBB45d2511A"
    }];
    let map = new Map();
    origTokens.forEach(t => {
      let key = t.chainType + "-" + t.tokenScAddr;
      map.set(key, t);
    });
    this.multiChainOrigToken = map;
    let ts = Date.now();
    console.debug("readMultiChainOrigToken %d consume %s ms", origTokens.length, ts - startTime);
  }

  getTokenPair(id) {
    return this.m_mapTokenPair.get(id);
  }

  getAssetLogo(name, protocol) {
    protocol = protocol ? protocol.toLowerCase() : "erc20";
    let key = name + "_" + protocol;
    let logo = AssetLogo[key];
    if (!logo) {
      logo = { data: new Identicon(createHash('md5').update(key).digest('hex')).toString(), type: "png" };
    }
    return logo;
  }

  getChainLogo(chainType) {
    let logo = ChainLogo[chainType];
    if (!logo) {
      logo = { data: new Identicon(createHash('md5').update(chainType || "").digest('hex')).toString(), type: "png" };
    }
    return logo;
  }

  customizeUI(tokenPair) {
    let direction = "both";
    tokenPair.direction = direction;
  }

  updateTokenPairInfo(tokenPair) {
    let ancestorChainInfo = this.chainInfoService.getChainInfoById(tokenPair.ancestorChainID);
    tokenPair.fromScInfo = this.chainInfoService.getChainInfoById(tokenPair.fromChainID);
    tokenPair.toScInfo = this.chainInfoService.getChainInfoById(tokenPair.toChainID);
    if (ancestorChainInfo && tokenPair.fromScInfo && tokenPair.toScInfo) {
      // ancestorSymbol keep original format for iwan api
      tokenPair.readableSymbol = tool.parseTokenPairSymbol(tokenPair.ancestorChainID, tokenPair.ancestorSymbol);
      tokenPair.ancestorChainType = ancestorChainInfo.chainType;
      tokenPair.ancestorChainName = ancestorChainInfo.chainName;
      this.chainName2Type.set(tokenPair.ancestorChainName, tokenPair.ancestorChainType);
      tokenPair.toDecimals = tokenPair.decimals || 0; // erc721 has no decimals
      tokenPair.fromDecimals = tokenPair.fromDecimals || tokenPair.toDecimals;
      tokenPair.protocol = tokenPair.toAccountType || "Erc20"; // fromAccountType always be the same as toAccountType
      try {
        this.updateTokenPairFromChainInfo(tokenPair);
        this.updateTokenPairToChainInfo(tokenPair);
        this.customizeUI(tokenPair); // put here to update symbol
        this.updateTokenPairCcHandle(tokenPair);
        return true;
      } catch (err) {
        console.error("ignore unavailable token pair %s(%s, %s<->%s): %O", tokenPair.id, tokenPair.ancestorSymbol, tokenPair.fromChainName, tokenPair.toChainName, err);
        return false; // can not get token info from chain
      }
    } else {
      console.log("ignore unsupported token pair %s(%s, %s<->%s)", tokenPair.id, tokenPair.ancestorSymbol, tokenPair.fromChainID, tokenPair.toChainID);
      return false; // lack of chain config, need to upgrade sdk
    }
  }

  updateTokenPairFromChainInfo(tokenPair) {
    tokenPair.fromChainType = tokenPair.fromScInfo.chainType;
    tokenPair.fromChainName = tokenPair.fromScInfo.chainName;
    this.chainName2Type.set(tokenPair.fromChainName, tokenPair.fromChainType);
    tokenPair.fromSymbol = tool.parseTokenPairSymbol(tokenPair.fromChainID, tokenPair.fromSymbol, { ancestorChain: tokenPair.ancestorChainID, protocol: tokenPair.protocol });
    tokenPair.fromIsNative = this.checkNativeToken(tokenPair.bridge, tokenPair.ancestorChainType, tokenPair.fromChainType, tokenPair.fromAccount);
    let issuer = this.tokenIssuer.get(tokenPair.fromChainType + "-" + tokenPair.fromAccount);
    if (issuer) {
      tokenPair.fromIssuer = {
        issuer: issuer.issuer || "",
        isNativeCoin: issuer.isNativeCoin || false
      };
    }
  }

  updateTokenPairToChainInfo(tokenPair) {
    tokenPair.toChainType = tokenPair.toScInfo.chainType;
    tokenPair.toChainName = tokenPair.toScInfo.chainName;
    this.chainName2Type.set(tokenPair.toChainName, tokenPair.toChainType);
    tokenPair.toSymbol = tool.parseTokenPairSymbol(tokenPair.toChainID, tokenPair.symbol, { ancestorChain: tokenPair.ancestorChainID, protocol: tokenPair.protocol });
    tokenPair.toIsNative = this.checkNativeToken(tokenPair.bridge, tokenPair.ancestorChainType, tokenPair.toChainType, tokenPair.toAccount);
    let issuer = this.tokenIssuer.get(tokenPair.toChainType + "-" + tokenPair.toAccount);
    if (issuer) {
      tokenPair.toIssuer = {
        issuer: issuer.issuer || "",
        isNativeCoin: issuer.isNativeCoin || false
      };
    }
  }

  checkNativeToken(bridge, ancestorChainType, chainType, tokenAccount) {
    if (ancestorChainType === chainType) { // coin or orig token
      return true;
    }
    let key = chainType + "-" + tokenAccount;
    let origToken = this.multiChainOrigToken.get(key);
    if (origToken) { // multichain orig token
      return true;
    }
    return false;
  }

  updateTokenPairCcHandle(tokenPair) {
    let fromChainInfo = tokenPair.fromScInfo;
    let toChainInfo = tokenPair.toScInfo;
    tokenPair.ccType = {};
    // other bridge
    if (tokenPair.bridge) {
      let bridgeKey = tokenPair.bridge + "Bridge";
      if (fromChainInfo[bridgeKey] && toChainInfo[bridgeKey]) {
        tokenPair.ccType["MINT"] = fromChainInfo._isEVM ? (bridgeKey + "Deposit") : (bridgeKey + fromChainInfo.chainName + "Deposit");
        tokenPair.ccType["BURN"] = toChainInfo._isEVM ? (bridgeKey + "Deposit") : (bridgeKey + toChainInfo.chainName + "Deposit");
      } else {
        throw new Error(bridgeKey + " unavailable");
      }
      return;
    }
    // common rule for tokenPairs
    this.setTokenCrossHandler(tokenPair, "MINT");
    this.setTokenCrossHandler(tokenPair, "BURN");
  }

  updateChainAssets(tokenPair) {
    let assetName = tokenPair.assetAlias || tokenPair.readableSymbol;
    // protocol
    let protocol = this.fromChainAssets.get(tokenPair.protocol);
    if (!protocol) {
      protocol = new Map();
      this.fromChainAssets.set(tokenPair.protocol, protocol);
    }
    // fromChain
    if (tokenPair.direction !== "t2f") {
      let chain = protocol.get(tokenPair.fromChainType);
      if (!chain) {
        chain = new Map();
        protocol.set(tokenPair.fromChainType, chain);
      }
      chain.set(assetName, { symbol: tokenPair.fromSymbol, address: tokenPair.fromAccount, decimals: tokenPair.fromDecimals, protocol: tokenPair.protocol });
    }
    // toChain
    if (tokenPair.direction !== "f2t") {
      if (tokenPair.toChainType !== tokenPair.fromChainType) { // USDC.e
        let chain = protocol.get(tokenPair.toChainType);
        if (!chain) {
          chain = new Map();
          protocol.set(tokenPair.toChainType, chain);
        }
        chain.set(assetName, { symbol: tokenPair.toSymbol, address: tokenPair.toAccount, decimals: tokenPair.toDecimals, protocol: tokenPair.protocol });
      }
    }
    return true;
  }

  // for internal call
  setTokenCrossHandler(tokenPair, direction) {
    let chainInfo = (direction === "MINT") ? tokenPair.fromScInfo : tokenPair.toScInfo;
    let tokenAccount = (direction === "MINT") ? tokenPair.fromAccount : tokenPair.toAccount;
    if (tokenAccount === "0x0000000000000000000000000000000000000000") {
      tokenPair.ccType[direction] = chainInfo.mintFromChainHandle || "MintCoin";
    } else if (chainInfo.chainId === tokenPair.ancestorChainID) {
      tokenPair.ccType[direction] = chainInfo.mintFromChainHandle || "MintErc20";
    } else {
      let key = chainInfo.chainType + "-" + tokenAccount;
      let origToken = this.multiChainOrigToken.get(key);
      if (origToken) {
        tokenPair.ccType[direction] = chainInfo.mintFromChainHandle || "MintErc20";
      } else {
        tokenPair.ccType[direction] = chainInfo.burnFromChainHandle || "BurnErc20";
      }
    }
  }

  // for external call
  getTokenEventType(tokenPairId, direction) {
    let tokenPair = this.getTokenPair(tokenPairId);
    if (direction === true) { // unify direction value
      direction = "MINT";
    } else if (direction === false) {
      direction = "BURN";
    }
    let chainType = (direction === "MINT") ? tokenPair.toChainType : tokenPair.fromChainType;
    let tokenAccount = (direction === "MINT") ? tokenPair.toAccount : tokenPair.fromAccount;
    let key = chainType + "-" + tokenAccount;
    let origToken = this.multiChainOrigToken.get(key);
    if (origToken || (tokenAccount === tokenPair.ancestorAccount)) { // original token or coin
      return "BURN"; // release
    } else {
      return "MINT";
    }
  }

  getChainType(chainName) {
    return this.chainName2Type.get(chainName);
  }

  getChainAssets(chainType, options) {
    let assets = {};
    options.protocols.forEach(p => {
      let protocol = this.fromChainAssets.get(p);
      if (protocol) {
        let chain = protocol.get(chainType);
        if (chain) {
          chain.forEach((tokenInfo, asset) => assets[asset] = tokenInfo);
        }
      }
    });
    return assets;
  }
}

export default TokenPairService;
