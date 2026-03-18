import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { APP_CHAIN } from "@/config/network";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined;

export const chains = [APP_CHAIN] as const;

export const wagmiConfig = walletConnectProjectId
  ? getDefaultConfig({
      appName: "MicroLeague",
      projectId: walletConnectProjectId,
      chains,
    })
  : createConfig({
      chains,
      connectors: [
        injected(),
        coinbaseWallet({ appName: "MicroLeague" }),
        // WalletConnect requires `VITE_WALLETCONNECT_PROJECT_ID`.
        // Add it later to enable WalletConnect / mobile wallets.
      ],
      transports: {
        [APP_CHAIN.id]:
          (import.meta.env.VITE_RPC_URL as string | undefined)
            ? http(import.meta.env.VITE_RPC_URL as string)
            : http(),
      },
    });
