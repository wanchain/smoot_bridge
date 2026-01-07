import { network } from '@/models/useSDK';
import React from 'react';
import { mainnetChainlist, testnetChainlist } from './config';
import { message } from 'antd';
import { isMobile } from 'react-device-detect';
import {
  EvmExtension,
} from '../sdk/index';
import metamaskIcon from 'images/icons/wallet/metamaskIcon.webp';
import rabbyIcon from 'images/icons/wallet/rabbyIcon.webp';
import okxIcon from 'images/icons/wallet/okxIcon.webp';

const INITIAL_STATE = {
  address: '',
  curAddress: '',
  accounts: [],
  web3: null,
  provider: null,
  connected: false,
  toConnected: false,
  networkId: network === 'testnet' ? 999 : 888, // TODO: CHANGE TO 888 AFTER JUPITER FORK
  wallet: null,
  toWallet: null,
  toProvider:  null,
  isSelectOneTimeAddr: false
};

const differ = (a, b) => {
  if (a.address !== b.address) {
    return 1;
  }

  if (a.networkId !== b.networkId) {
    return 1;
  }

  if (a.connected !== b.connected) {
    return 1;
  }

  return 0;
};

export const WalletContext = React.createContext({}, differ);

class Wallet extends React.Component {
  constructor(props) {
    super(props);
    const intiState = {
      ...INITIAL_STATE,
      resetApp: this.resetApp,
      connect: this.onConnect,
      switchNetwork: this.switchNetwork,
      getLogo: this.getLogo,
      resetCurAddress: this.resetCurAddress,
      resetToWallet: this.resetToWallet,
      resetAccount: this.resetAccount,
    };

    this.setWallet = props.setWallet;
    this.clv = null;
    this.setWallet(intiState);
  }

  checkWallet = async (name = 'metamask') => {
    if (name === 'metamask') {
      if (!window.ethereum && !window.web3) return false;
    } else if (name === 'rabby') {
      if (!window.rabby)return false;
    } else if (name === 'okx') {
      if (!window.okxwallet && !window.okexchain) return false;
    } else if (name === 'ctrl') {
      if (!window?.ctrlEthProviders?.['Ctrl Wallet']) return false;
    } else {
      return true;
    }
    return true;
  }

  onConnect = async (name, direction, fromChain, isAutoConnect) => {
    const checkRes = await this.checkWallet(name);
    if (!checkRes && isAutoConnect) {
      window.localStorage.removeItem('fromConnectWallet');
      window.localStorage.removeItem('fromConnectWalletChain');
      return;
    }
    let type = 'evm';
    if (direction === 'from' && this.props.wallet) {
      this.removeListienr(this.props.wallet.wallet)
    }
    try {
      let wallet, accounts, address, networkId, provider;
      if (!name && !direction) {
        name = this.props.wallet.name;
        direction = 'from';
      }
      if (name === 'metamask') {
        wallet = new EvmExtension.MetamaskWallet();
        await wallet.getWallet();
        accounts = await wallet.getAccounts();
      } else if (name === 'rabby') {
        wallet = new EvmExtension.RabbyWallet();
        await wallet.getWallet();
        accounts = await wallet.getAccounts();
        type = 'evm';
      } else if (name === 'okx') {
        wallet = new EvmExtension.OkxWallet();
        await wallet.getWallet();
        accounts = await wallet.getAccounts();
        type = 'evm';
      } else {
        wallet = new EvmExtension.MetamaskWallet();
        await wallet.getWallet();
        accounts = await wallet.getAccounts();
        type = 'evm';
      }
      address = accounts[0];
      provider = wallet;
      await this.subscribeProvider(wallet, name);
      if (direction === 'to') {
        await this.setWallet({
          ...this.props.wallet,
          toType: type,
          toProvider: provider,
          toName: name,
          toWallet: wallet,
          toConnected: true,
          toAddress: address,
          toAccounts: accounts,
          toNetworkId: networkId,
          resetApp: this.resetApp,
          connect: this.onConnect,
          switchNetwork: this.switchNetwork,
          getLogo: this.getLogo,
          resetCurAddress: this.resetCurAddress,
          resetToWallet: this.resetToWallet,
          resetAccount: this.resetAccount
        });
      } else {
        window.localStorage.setItem('fromConnectWallet', name);
        window.localStorage.setItem('fromConnectWalletChain', fromChain);
        await this.setWallet({
          ...this.props.wallet,
          type,
          name,
          provider,
          wallet: wallet,
          connected: true,
          address,
          curAddress: '',
          accounts,
          networkId,
          isSelectOneTimeAddr: false,
          resetApp: this.resetApp,
          connect: this.onConnect,
          switchNetwork: this.switchNetwork,
          getLogo: this.getLogo,
          resetCurAddress: this.resetCurAddress,
          resetToWallet: this.resetToWallet,
          resetAccount: this.resetAccount
        });
      }
      
    } catch (e) {
      console.error(e);
    }
  };

  accountsChanged = async (accounts) => {
    await this.setWallet({ ...this.props.wallet, address: accounts[0] });
  };

  chainChanged = async (event) => {
    // console.debug('event', event);
    const { web3 } = this.props.wallet;
    if (web3) {
      const networkId = await web3.eth.net.getId();
      await this.setWallet({ ...this.props.wallet, networkId });
    } else {
      await this.setWallet({ ...this.props.wallet, networkId: event });
    }
  }

  networkChanged = async (networkId) => {
    await this.setWallet({ ...this.props.wallet, networkId });
  }

  subscribeProvider = async (provider, name) => {
    if (!provider || !provider.on) {
      return;
    }
    if (['metamask', 'rabby', 'okx', 'ctrl'].includes(name)) {
      provider.on(name, 'close', this.resetApp);
      provider.on(name, 'accountsChanged', this.accountsChanged);
    } else {
      provider.on('close', this.resetApp);
      provider.on('accountsChanged', this.accountsChanged);
    }
  };

  removeListienr = async (provider) => {
    if (!provider || !provider.off) {
      return;
    }
    provider.off('close', this.resetApp);
    provider.off('accountsChanged', this.accountsChanged);
    provider.off('chainChanged', this.chainChanged);

    provider.off("networkChanged", this.networkChanged);
  }

  resetApp = async () => {
    const { wallet } = this.props.wallet;
    if (!wallet) return;
    window.localStorage.removeItem('fromConnectWallet');
    if (wallet && wallet.currentProvider && wallet.currentProvider.close) {
      await wallet.currentProvider.close();
    }
    if (wallet && wallet.currentProvider && wallet.currentProvider.removeAllListeners) {
      wallet.currentProvider.removeAllListeners();
    }
    if (wallet && wallet.disconnect) {
      wallet.disconnect()
    }
    
    this.setWallet({
      ...INITIAL_STATE,
      resetApp: this.resetApp,
      connect: this.onConnect,
      getLogo: this.getLogo,
      resetCurAddress: this.resetCurAddress,
      resetToWallet: this.resetToWallet,
      resetAccount: this.resetAccount
    });
  };

  getLogo = () => {
    switch (this.props.wallet.name) {
      case 'metamask':
        return metamaskIcon;
      case 'rabby':
        return rabbyIcon;
      case 'okx':
        return okxIcon;
      default:
        return metamaskIcon;
    }
  };
  switchNetwork = async (chainname, wallet) => {
    const chainlist =
      network === 'testnet' ? testnetChainlist : mainnetChainlist;
    const param = chainlist.get(chainname);
    if (!param) return;
    let provider;
    if (!wallet) {
      if (!window.ethereum) {
        return;
      }
      provider = window.ethereum;
    } else {
      if (wallet.getWallet) {
        provider = await wallet.getWallet();
        provider = provider.currentProvider;
      }
    }
    if (!provider?.request) return;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: param.chainId }],
      });
      this.onConnect();
    } catch (switchError) {
      console.log('switchError', switchError)
      try {
        let obj;
        try {
          if (typeof JSON.parse(switchError.message) == "object") {
            obj = JSON.parse(switchError.message);
          }
        } catch (e) {
          console.log('message is not a JSON', e);
        }
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902 || ((window.rabby || isMobile) && switchError.code === -32603)) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [param],
            });
            this.onConnect();
            return;
          } catch (addError) {
            // handle "add" error
            console.error('addError1', addError);
            message.warning(addError.message);
            return;
          }
        } else {
          if (!!obj && !!obj.data && !!obj.data.originalError && !!obj.data.originalError.code && obj.data.originalError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [param],
              });
              this.onConnect();
              return;
            } catch (addError) {
              // handle "add" error
              message.warning(JSON.parse(addError.message).message);
              console.error('addError', addError);
              return;
            }
          }
        }
        message.warning(obj ? String(obj?.message) : switchError.message);
      } catch(e) {
        console.error(e);
      }
    }
  };

  resetCurAddress = async (address) => {
    await this.setWallet({
      ...this.props.wallet,
      curAddress: address
    })
  }

  resetAccount = async (direction) => {
    const accounts = await this.props.wallet.wallet.getAccounts();
    const networkId = await this.props.wallet.wallet.getChainId();
    const address = accounts[0];
    if (direction === 'to') {
      await this.setWallet({
        ...this.props.wallet,
        toAddress: address,
        toAccounts: accounts,
        toNetworkId: networkId
      });
    } else {
      await this.setWallet({
        ...this.props.wallet,
        address,
        accounts,
        networkId
      })
    }
  }

  resetToWallet = async () => {
    await this.setWallet({
      ...this.props.wallet,
      toType: null,
      toName: null,
      toWallet: null,
      toProvider: null,
      toConnected: false,
      toAddress: null,
      toAccounts: null,
      toNetworkId: null,
    })
  }

  render() {
    return <></>;
  }
}

export default Wallet;
