import WAValidator from "multicoin-address-validator";
import BigNumber from "bignumber.js";
import { createHash } from 'crypto-browserify';
import Web3 from "web3";

const web3 = new Web3();

function getCurTimestamp(toSecond = false) {
  let ts = new Date().getTime();
  if (toSecond) {
    ts = parseInt(ts / 1000);
  }
  return ts;
}

function checkTimeout(baseTimestamp, milliSecond) {
  let cur = getCurTimestamp();
  let base = parseInt(baseTimestamp);
  let timeout = parseInt(milliSecond);
  return (cur > (base + timeout));
}

async function sleep(time) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function hexStrip0x(hexStr) {
  if (0 == hexStr.indexOf('0x')) {
    return hexStr.slice(2);
  }
  return hexStr;
}

function bytes2hex(bytes) {
  return Array.from(bytes, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function hex2bytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function ascii2letter(asciiStr) {
  let str = hexStrip0x(asciiStr.trim());
  let len = str.length;
  if (len % 2 != 0) {
    return '';
  }
  let letterStr = [];
  for (var i = 0; i < len; i = i + 2) {
    let tmp = str.substr(i, 2);
    if (tmp !== '00') {
      let char = String.fromCharCode(parseInt(tmp, 16));
      if (/[0-9A-Za-z\+\/\-\_=\.\:]/.test(char)) {
        letterStr.push(char);
      }
    }
  }
  return letterStr.join('');
}

function isValidEthAddress(address) {
  let valid = WAValidator.validate(address, 'ETH');
  return valid;
}

/*
  there are several address format:
  native: mainly for ui
  evm: cross from evm, encode recipient as ascii hex for non-evm chain
*/
function getStandardAddressInfo(chainType, address, extension = null) {
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return { native: address, evm: address };
  } else { // default text format
    let evmBytes = web3.utils.asciiToHex(address);
    return { native: address, evm: evmBytes };
  }
}

function parseFee(fee, amount, unit, options) {
  options = Object.assign({ formatWithDecimals: true }, options);
  let result = new BigNumber(0), networkFee = new BigNumber(0), decimals = 0, tmp;
  if (fee.networkFee.unit === unit) {
    tmp = new BigNumber(fee.networkFee.value);
    if (tmp.gt(0) && fee.networkFee.isRatio) {
      tmp = tmp.times(amount);
      if ((fee.networkFee.min != 0) && (tmp.lt(fee.networkFee.min))) {
        tmp = new BigNumber(fee.networkFee.min);
      } else if ((fee.networkFee.max != 0) && (tmp.gt(fee.networkFee.max))) {
        tmp = new BigNumber(fee.networkFee.max);
      }
    }
    if (fee.networkFee.discount) {
      tmp = tmp.times(fee.networkFee.discount);
    }
    networkFee = tmp;
    if ((!options.feeType) || (options.feeType === "networkFee")) {
      result = result.plus(networkFee);
    }
    decimals = fee.networkFee.decimals;
  }
  if ((fee.operateFee.unit === unit) && ((!options.feeType) || (options.feeType === "operateFee"))) {
    tmp = new BigNumber(fee.operateFee.value);
    if (tmp.gt(0) && fee.operateFee.isRatio) {
      tmp = tmp.times(new BigNumber(amount).minus(networkFee));
      if ((fee.operateFee.min != 0) && (tmp.lt(fee.operateFee.min))) {
        tmp = new BigNumber(fee.operateFee.min);
      } else if ((fee.operateFee.max != 0) && (tmp.gt(fee.operateFee.max))) {
        tmp = new BigNumber(fee.operateFee.max);
      }
    }
    if (fee.operateFee.discount) {
      tmp = tmp.times(fee.operateFee.discount);
    }
    result = result.plus(tmp);
    decimals = fee.operateFee.decimals;
  }
  if (options.formatWithDecimals) {
    return new BigNumber(result.toFixed(decimals, options.roundingMode)).toFixed(); // remove padded '0'
  } else {
    return result.times(Math.pow(10, decimals)).toFixed(0, options.roundingMode);
  }
}

function sha256(str, addPrefix = true) {
  let hash = createHash('sha256').update(str).digest('hex');
  return addPrefix ? ('0x' + hash) : hash;
}

function sha3(str) {
  return web3.utils.keccak256(str); // with prefix '0x'
}

function cmpAddress(address1, address2) {
  // compatible with tron '41' or xdc 'xdc' prefix
  return (address1.substr(-40).toLowerCase() === address2.substr(-40).toLowerCase());
}

function parseTokenPairSymbol(chain, symbol, options = {}) {
  return symbol;
}

function getErrMsg(err, defaultMsg) {
  if (typeof (err) === "string") {
    return err;
  }
  if (err.message && (typeof (err.message) === "string")) {
    return err.message;
  }
  let msg = err.toString();
  if (msg && (msg[0] !== '[') && (msg[msg.length - 1] !== ']')) { // "[object Object]"
    return msg;
  }
  return defaultMsg || "Unknown error";
}

function parseEvmLog(log, abi) {
  let abiJson = abi.find(json => {
    if (json.type !== 'event') {
      return false;
    }
    let hash = json.cacheHash;
    if (!hash) {
      hash = web3.eth.abi.encodeEventSignature(json);
      json.cacheHash = hash;
    }
    return (hash === log.topics[0]);
  });
  if (abiJson) {
    try {
      // topics without the topic[0] if its a non-anonymous event, otherwise with topic[0].
      let topics = log.topics.concat();
      topics.splice(0, 1);
      let args = web3.eth.abi.decodeLog(abiJson.inputs, log.data, topics);
      for (var index = 0; index < abiJson.inputs.length; index++) {
        if (args.hasOwnProperty(index)) {
          delete args[index];
        }
      }
      log.eventName = abiJson.name;
      log.args = args;
    } catch (err) {
      console.error("parseLog error: %O", err);
    }
  }
  return log;
}

async function timedPromise(promise, msg = 'PTIMEOUT', ms = 5000) {
  let timer;
  let wrappedPromise = Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error(msg));
      }, ms);
    }),
  ]);
  return wrappedPromise.then((result) => {
    clearTimeout(timer);
    return result;
  }).catch((err) => {
    clearTimeout(timer);
    throw err;
  });
}

export { getCurTimestamp };
export { checkTimeout };
export { sleep };
export { hexStrip0x };
export { bytes2hex };
export { hex2bytes };
export { ascii2letter };
export { isValidEthAddress };
export { getStandardAddressInfo };
export { parseFee };
export { sha256 };
export { sha3 };
export { cmpAddress };
export { parseTokenPairSymbol };
export { getErrMsg };
export { parseEvmLog };
export { timedPromise };

export default {
  getCurTimestamp,
  checkTimeout,
  sleep,
  hexStrip0x,
  bytes2hex,
  hex2bytes,
  ascii2letter,
  isValidEthAddress,
  getStandardAddressInfo,
  parseFee,
  sha256,
  sha3,
  cmpAddress,
  parseTokenPairSymbol,
  getErrMsg,
  parseEvmLog,
  timedPromise
};
