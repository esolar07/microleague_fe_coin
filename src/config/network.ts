import { base, baseSepolia, sepolia } from "wagmi/chains";

export type NetworkKey = "sepolia" | "baseSepolia" | "base";

const networkKey = (import.meta.env.VITE_NETWORK as NetworkKey | undefined) ?? "sepolia";

export const APP_CHAIN =
  networkKey === "base"
    ? base
    : networkKey === "baseSepolia"
      ? baseSepolia
      : sepolia;

export const APP_CHAIN_ID = APP_CHAIN.id;

