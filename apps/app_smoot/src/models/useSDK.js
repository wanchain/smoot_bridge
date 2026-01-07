import { message } from 'antd';
import { createGlobalStore } from 'hox';
import { useCallback, useEffect, useState } from 'react';
import {
  SmootBridge,
} from '../sdk/index';

export const network = 'testnet';

const bridgeInstance = new SmootBridge(network);

const useSDK = () => {
  const [tokenPairs, setTokenPairs] = useState([]);
  const [tokenProtocol, setTokenProtocol] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [bridge, setBridge] = useState(bridgeInstance);
  const [currentTaskId, setCurrentTaskId] = useState(undefined);
  const [subscriber, setSubscriber] = useState({});
  const [subscriber2, setSubscriber2] = useState({});

  //bridge event callback
  const [lockInfo, setLockInfo] = useState(null);
  const [lockedInfo, setLockedInfo] = useState(null);
  const [redeemInfo, setRedeemInfo] = useState(null);
  // const [claimableInfo, setClaimableInfo] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [accountTime, setAccountTime] = useState(0);

  const dispatch = useCallback(
    (taskId, ...args) => {
      if (taskId in subscriber) {
        subscriber[taskId].call(undefined, ...args);
      }
    },
    [subscriber],
  );

  const dispatch2 = useCallback(
    (taskId, ...args) => {
      if (taskId in subscriber2) {
        subscriber2[taskId].call(undefined, ...args);
      }
    },
    [subscriber2],
  )

  const initStatusInfo = () => {
    setRedeemInfo(null);
    setErrorInfo(null);
    setLockInfo(null);
    setLockedInfo(null);
  }

  useEffect(() => {
    setBridge(bridgeInstance);
  }, [])

  useEffect(() => {
    if (lockInfo && (currentTaskId === lockInfo.taskId)) {
      dispatch(lockInfo.taskId, 'lock', lockInfo);
    }
  }, [dispatch, lockInfo, currentTaskId]);

  useEffect(() => {
    if (lockInfo && (currentTaskId === lockInfo.taskId)) {
      dispatch2(lockInfo.taskId, 'lock', lockInfo);
    }
  }, [dispatch2, lockInfo, currentTaskId]);

  useEffect(() => {
    if (lockedInfo && (currentTaskId === lockedInfo.taskId)) {
      dispatch2(lockedInfo.taskId, 'locked', lockedInfo);
    }
  }, [dispatch2, lockedInfo, currentTaskId]);

  // useEffect(() => {
  //   if (claimableInfo) {
  //     dispatch(claimableInfo.taskId, 'claimable', claimableInfo);
  //   }
  // }, [claimableInfo]);

  useEffect(() => {
    if (redeemInfo && (currentTaskId === redeemInfo.taskId)) {
      dispatch(redeemInfo.taskId, 'redeem', redeemInfo);
    }
  }, [dispatch, redeemInfo, currentTaskId]);

  useEffect(() => {
    if (redeemInfo && (currentTaskId === redeemInfo.taskId)) {
      dispatch2(redeemInfo.taskId, 'redeem', redeemInfo);
    }
  }, [dispatch2, redeemInfo, currentTaskId]);

  useEffect(() => {
    if (errorInfo && (currentTaskId === errorInfo.taskId)) {
      dispatch(errorInfo.taskId, 'error', errorInfo);
      if (!errorInfo.taskId) return;
    }
  }, [dispatch, errorInfo, currentTaskId]);

  useEffect(() => {
    if (errorInfo && (currentTaskId === errorInfo.taskId)) {
      dispatch2(errorInfo.taskId, 'error', errorInfo);
      if (!errorInfo.taskId) return;
    }
  }, [dispatch2, errorInfo, currentTaskId]);

  useEffect(() => {
    bridge
      .on('ready', async (assetPairs) => {
        // console.log('-------assetPairs:', assetPairs);
        setTokenPairs(assetPairs);
        setLoading(false);
      })
      .on('error', (info) => {
        console.log('-------error:', info);
        if (!['Network Instability Detected', 'UTXO Consolidation Required'].includes(info.reason)) {
          message.warning(info.reason);
        }
        
        setErrorInfo(info);
        setLockInfo(null);
        setLockedInfo(null);
        // setLoading(false);
      })
      .on('lock', (info) => {
        console.log('-------lock:', info);
        setLockInfo(info);
      })
      .on('locked', (info) => {
        console.log('-------locked:', info);
        setLockedInfo(info);
      })
      .on('redeem', (info) => {
        console.log('-------redeem:', info);
        setRedeemInfo(info);
      })
      .on('account', (info) => {
        console.log('!-------account:', info);
        setAccountTime(Date.now());

        if (info.wallet === 'MetaMask' && info.account.length > 0) {
          setAccount(info.account);
          setConnected(true);
        }

        if (info.wallet === 'polkadot{.js}' && info.accounts.length > 0) {
          setAccount(info.accounts[0]);
          setConnected(true);
        }
      });

    bridge.init();
  }, [bridge]);

  useEffect(() => {
    let assetList = [];
    let tmpTokenProtocol = {};

    tokenPairs.forEach((item) => {
      assetList.push(item);
      tmpTokenProtocol[item.assetAlias || item.assetType] = item.protocol;
    });
    setTokenProtocol(tmpTokenProtocol);
  }, [tokenPairs]);

  const subscribe = useCallback(
    (taskId, cb) => {
      setSubscriber({
        ...subscriber,
        [taskId]: cb,
      });
    },
    [subscriber],
  );

  const subscribe2 = useCallback(
    (taskId, cb) => {
      setSubscriber2({
        ...subscriber2,
        [taskId]: cb,
      });
    },
    [subscriber2],
  )

  const getHistory = useCallback((opt) => {
    const history = bridge.getHistory(opt);
    return history;
  }, [bridge]);

  const getHistoryNumber = useCallback((opt) => {
    const num = bridge.getHistoryNumber(opt);
    return num;
  }, [bridge]);

  const deleteHistory = useCallback(async (opt) => {
    await bridge.deleteHistory(opt);
  }, [bridge]);

  const getChainAssets = useCallback(async (opt) => {
    let list = await bridge.getChainAssets(opt);
    let copyList = JSON.parse(JSON.stringify(list));
    let priceObj = window.localStorage.getItem('priceInfo');
    if (opt.price) {
      priceObj = priceObj ? JSON.parse(priceObj) : {};
      const map = new Map();
      for (let key in copyList) {
        copyList[key] = copyList[key].map(v => {
          if (v.price) {
            map.set(v.asset, v);
          } else {
            if (priceObj[v.asset]) {
              v.price = priceObj[v.asset];
            }
          }
          return v;
        })
      }
      [...map.values()].forEach(v => {
        if (v.price) {
          priceObj[v.asset] = v.price;
        }
      })
      window.localStorage.setItem('priceInfo', JSON.stringify(priceObj));
      list = copyList;
    }
    return list;
  }, [bridge]);

  const getFromChains = useCallback(async (opt) => {
    const list = await bridge.getFromChains(opt);
    return list;
  }, [bridge]);

  const getToChains = useCallback(async (...args) => {
    const list = await bridge.getToChains(...args);
    return list;
  }, [bridge]);

  const getAssetLogo = useCallback(
    (name, protocol) => {
      let data;
      if (typeof protocol === 'string') {
        let chainName = name;
        if (['BTC.a', 'wanBTC'].includes(name)) chainName = 'BTC';
        if (['USDC.e'].includes(name)) chainName = 'USDC';
        data = bridge.getAssetLogo(chainName, protocol);
      } else {
        data = bridge.getChainLogo(name);
      }
      return `data:image/${data.type};base64,${data.data}`;
    },
    [bridge],
  );

  const validateAddress = useCallback(
    (...args) => {
      return bridge.validateAddress(...args);
    },
    [bridge],
  );

  const estimateFee = useCallback(
    (...args) => {
      return bridge.estimateFee(...args);
    },
    [bridge],
  );

  const getRewardTasks = useCallback(
    (...args) => {
      return bridge.getRewardTasks(...args);
    },
    [bridge],
  );

  const getChainInfo = useCallback(
    (...args) => {
      return bridge.getChainInfo(...args);
    },
    [bridge],
  );

  return {
    loading,
    tokenProtocol,
    connected,
    account,
    bridge,
    accountTime,

    currentTaskId,
    subscriber,
    setCurrentTaskId,
    dispatch,
    subscribe,
    subscribe2,
    setSubscriber,
    initStatusInfo,
//
    getHistory,
    getHistoryNumber,
    deleteHistory,

    getChainAssets,
    getFromChains,
    getToChains,
//
    validateAddress,
    estimateFee,
    getAssetLogo,

    getRewardTasks,

    getChainInfo
  };
};

export const [useSDKStore] = createGlobalStore(useSDK);

export default useSDKStore;
