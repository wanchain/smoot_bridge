import * as _ from "lodash";
import configMainnet from "../../config/config_mainnet.json" with { type: "json" };
import configTestnet from "../../config/config_testnet.json" with { type: "json" };
import erc20 from "../../config/abi/erc20.json" with { type: "json" };
import smootHome from "../../config/abi/smootBridge/home.json" with { type: "json" };
import smootRemote from "../../config/abi/smootBridge/remote.json" with { type: "json" };
import smootGateway from "../../config/abi/smootBridge/gateway.json" with { type: "json" };

const config = {
  "mainnet": configMainnet,
  "testnet": configTestnet
};

const abis = {
  "erc20": erc20,
  "smootHome": smootHome,
  "smootRemote": smootRemote,
  "smootGateway": smootGateway,
};

class ConfigService {
  constructor() {
    this.extensions = new Map();
  }

  async init(network, options) {
    this.network = network;
    this.curConfig = config[network];
    // console.debug(this.curConfig);
    await this._initExtensions(options.extensions || []);
  }

  getNetwork() {
    return this.network;
  }

  getAbi(contractName) {
    return abis[contractName];
  }

  getExtension(chainType) {
    return this.extensions.get(chainType);
  }

  getConfig(serviceName, propertyPath) {
    let fullPropertyPath = serviceName;
    if (propertyPath && propertyPath !== '.') {
      fullPropertyPath = fullPropertyPath + '.' + propertyPath;
    }
    let ret = _.get(this.curConfig, fullPropertyPath);
    return ret;
  }

  getGlobalConfig(name) {
    return _.get(this.curConfig, name);
  }

  async _initExtensions(extensions) {
    if (!Array.isArray(extensions)) {
      extensions = [extensions];
    }
    await Promise.all(extensions.map(async (ext, i) => {
      if (ext.getChains && ext.getSymbols) { // not necessary for extensions which only define wallets
        let chains = ext.getChains();
        let symbols = ext.getSymbols();
        if (chains && symbols && (chains.length === symbols.length)) {
          if (ext.init) {
            await ext.init(this.network);
          }
          symbols.forEach((symbol, i) => {
            this.extensions.set(symbol, ext);
            console.debug("register %s(%s) extension", chains[i], symbol);
          });
          return;
        }
      }
    }));
  }
}

export default ConfigService;
