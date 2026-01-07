export const mainnetChainlist = new Map([
  [
    'Ethereum',
    {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      rpcUrls: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      blockExplorerUrls: 'https://etherscan.io',
      nativeCurrency: {
        name: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  ],
  [
    'Polygon',
    {
      chainId: '0x89',
      chainName: 'Matic(Polygon) Mainnet',
      rpcUrls: ['https://rpc-mainnet.matic.network'],
      blockExplorerUrls: ['https://polygonscan.com'],
      nativeCurrency: {
        name: 'POL',
        symbol: 'POL',
        decimals: 18,
      },
    },
  ],
]);

export const testnetChainlist = new Map([
  [
    'Ethereum',
    {
      chainId: '0xaa36a7',
      chainName: 'Sepolia',
      rpcUrls: ['https://ethereum-sepolia.rpc.subquery.network/public'],
      // 'https://eth-goerli.g.alchemy.com/v2/xQqI64lWoD6pTXMQT_fECzM0nW--4Vq1',
      blockExplorerUrls: [
        'https://sepolia.etherscan.io',
      ],
      nativeCurrency: {
        name: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  ],
  [
    'Polygon',
    {
      chainId: '0x13882',
      chainName: 'Matic(Polygon) Testnet Amoy',
      rpcUrls: ['https://rpc-amoy.polygon.technology'],
      blockExplorerUrls: ['https://www.oklink.com/amoy'],
      nativeCurrency: {
        name: 'POL',
        symbol: 'POL',
        decimals: 18,
      },
    },
  ],
]);
