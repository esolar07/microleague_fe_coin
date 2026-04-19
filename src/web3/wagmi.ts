import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
  baseAccount,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { connector as cdpConnector } from "@/providers/CoinbaseProvider";
import { APP_CHAIN } from "@/config/network";
import { baseSepolia, sepolia } from "viem/chains";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined;

// Only include wallets that don't require a WalletConnect projectId when it's absent.
// baseAccount (Coinbase Wallet extension/Smart Wallet) only added when projectId exists.
// CDP email/SMS login is handled via SignInModal — cdpConnector bridges that session into wagmi.
const rbkConnectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        injectedWallet,
        metaMaskWallet,
        ...(walletConnectProjectId ? [baseAccount] : []),
      ],
    },
  ],
  {
    appName: "MicroLeague",
    projectId: walletConnectProjectId ?? "dummy",
  },
);

export const wagmiConfig = createConfig({
  // cdpConnector MUST be here — it bridges the CDP email/SMS session into wagmi
  // so useAccount / useSignMessage work after the user signs in via SignInModal.
  connectors: [...rbkConnectors, cdpConnector],
  chains: [baseSepolia],
  transports: {
    // [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});
