import { apiFetch } from "@/lib/api";

export interface OnrampUrlParams {
  projectId: string;
  destinationAddress: string;
  chainId: number;
  presetFiatAmount: number;
  redirectUrl: string;
}

function getNetworkName(_chainId: number): string {
  // Base mainnet (8453) and Base Sepolia (84532) both map to "base"
  // All other chains also fall back to "base" as the safe default
  return "base";
}

export function generateOnrampUrl(params: OnrampUrlParams): string {
  const { projectId, destinationAddress, chainId, presetFiatAmount, redirectUrl } = params;

  if (!projectId) {
    throw new Error("COINBASE_PROJECT_ID is not configured");
  }

  const network = getNetworkName(chainId);

  const destinationWallets = JSON.stringify([
    {
      address: destinationAddress,
      assets: ["USDC"],
      supportedNetworks: [network],
    },
  ]);

  const url = new URL("https://pay.coinbase.com/buy/select-asset");
  url.searchParams.set("appId", projectId);
  url.searchParams.set("destinationWallets", destinationWallets);
  url.searchParams.set("presetFiatAmount", String(presetFiatAmount));
  url.searchParams.set("redirectUrl", redirectUrl);

  return url.toString();
}

/**
 * Fetches a secure Coinbase Onramp URL from the backend.
 * The backend generates a session token via the CDP API, which satisfies
 * the "secure initialization" requirement on projects that have it enabled.
 */
export async function fetchOnrampUrl(params: {
  destinationAddress: string;
  presetFiatAmount: number;
  redirectUrl: string;
}): Promise<string> {
  const data = await apiFetch<{ onrampUrl: string }>("/onramp/session", {
    method: "POST",
    json: params,
  });
  return data.onrampUrl;
}
