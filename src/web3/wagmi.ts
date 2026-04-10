import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { sepolia } from "viem/chains";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined;

// ✅ No baseAccount here — CDP handles email login separately
const rbkConnectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'MicroLeague',
    projectId: walletConnectProjectId,
  }
);

export const wagmiConfig = createConfig({
  // cdpConnector is managed by CDPReactProvider — not needed here
  connectors: [...rbkConnectors],
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});