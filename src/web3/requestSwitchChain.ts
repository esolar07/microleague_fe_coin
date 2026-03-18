import type { Chain } from "wagmi/chains";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getEthereum(): Eip1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).ethereum as Eip1193Provider | undefined;
}

function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}

export async function requestSwitchChain(chain: Chain): Promise<void> {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("No injected wallet found");

  const hexChainId = toHexChainId(chain.id);

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (error: any) {
    // 4902 = unknown chain in MetaMask
    if (error?.code !== 4902) throw error;

    const rpcUrl =
      chain.rpcUrls?.default?.http?.[0] ??
      chain.rpcUrls?.public?.http?.[0] ??
      undefined;
    if (!rpcUrl) throw new Error(`Missing RPC URL for ${chain.name}`);

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hexChainId,
          chainName: chain.name,
          rpcUrls: [rpcUrl],
          nativeCurrency: chain.nativeCurrency,
          blockExplorerUrls: chain.blockExplorers?.default?.url
            ? [chain.blockExplorers.default.url]
            : undefined,
        },
      ],
    });
  }
}

