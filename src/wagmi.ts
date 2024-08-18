import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { metaMask } from 'wagmi/connectors'


export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'OnchainSweeper', // Name of your dApp
        url: '', // (Optional) URL of your dApp
      },
    }),
    coinbaseWallet({
      appName: 'OnchainSweeper',
      preference: 'smartWalletOnly'
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
