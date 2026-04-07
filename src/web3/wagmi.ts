import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { APP_CHAIN } from "@/config/network";
import { connector } from "@/providers/CoinbaseProvider";
import { sepolia } from "viem/chains";

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
      connectors: [connector],
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(),
      },
    });
