
import metamaskIcon from 'images/icons/wallet/metamask.webp';
import rabbyIcon from 'images/icons/wallet/rabby.webp';
import okxIcon from 'images/icons/wallet/okx.webp';

// online config
export const onlineWalletMap = new Map([
  ['EVM Compatible', [
    {
      name: 'MetaMask',
      type: 'evm',
      icon: metamaskIcon,
      walletName: 'metamask'
    },
    {
      name: 'Rabby Wallet',
      type: 'evm',
      icon: rabbyIcon,
      walletName: 'rabby'
    },
    {
      name: 'OKX Wallet',
      type: 'evm',
      icon: okxIcon,
      walletName: 'okx'
    },
  ]]
]);

export const onlineWalletTypeMap = new Map([
  ['evm', 'EVM Compatible'],
]);