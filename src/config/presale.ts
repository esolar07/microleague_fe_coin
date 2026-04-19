import type { Address } from "viem";
import { APP_CHAIN } from "@/config/network";
import { baseSepolia } from "viem/chains";

function asAddress(value: string | undefined): Address | undefined {
  if (!value) return undefined;
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return value as Address;
  return undefined;
}

export const PRESALE_ADDRESS = asAddress(
  import.meta.env.VITE_PRESALE_ADDRESS as string | undefined,
);

export const PAYMENT_TOKEN_DECIMALS = Number(
  (import.meta.env.VITE_USDC_DECIMALS as string | undefined) ?? "6",
);

// Default USDC only for Base mainnet; for Sepolia/BaseSepolia you should set `VITE_USDC_ADDRESS`
export const USDC_ADDRESS = (() => {
  const configured = asAddress(
    import.meta.env.VITE_USDC_ADDRESS as string | undefined,
  );
  if (configured) return configured;

  if (APP_CHAIN.id === baseSepolia.id) {
    return "0x2893B96f3Ec2793b905eE0Fc12A5bDeaA7A4Fc8b" as Address;
  }

  return undefined;
})();
