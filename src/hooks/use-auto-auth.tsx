import { useEffect, useRef } from "react";
import { useAccount, useChainId, useSignMessage, useSwitchChain } from "wagmi";
import { useAuth } from "@/hooks/use-auth";
import { authenticateWallet } from "@/services/auth";
import { APP_CHAIN } from "@/config/network";

/**
 * Runs at app root. On mount (and on wallet connect), if the wallet is
 * connected but there is no backend session, silently sign a message and
 * create the session — no modal required.
 */
export function useAutoAuth() {
  const { address, isConnected, connector, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const { isAuthenticated, login } = useAuth();

  const attempted = useRef(false);
  const inProgress = useRef(false);

  useEffect(() => {
    // Wait until wagmi finishes reconnecting on page load
    if (isReconnecting) return;
    if (!isConnected || !address) return;
    if (isAuthenticated) return;
    if (inProgress.current) return;
    // Only attempt once per mount/connect cycle
    if (attempted.current) return;

    attempted.current = true;

    (async () => {
      inProgress.current = true;
      try {
        // Switch chain if needed
        if (chainId !== APP_CHAIN.id) {
          await switchChainAsync({ chainId: APP_CHAIN.id });
        }

        const timestamp = Date.now();
        const issuedAt = new Date(timestamp).toISOString();
        const origin = window.location.origin;

        const message = [
          "MicroLeague wants you to sign in with your Ethereum account:",
          address,
          "",
          `URI: ${origin}`,
          "Version: 1",
          `Chain ID: ${APP_CHAIN.id}`,
          `Nonce: ${timestamp}`,
          `Issued At: ${issuedAt}`,
        ].join("\n");

        const signature = await signMessageAsync({ account: address, message });

        const connectorName = connector?.name?.toLowerCase() ?? "";
        const connectorId = connector?.id?.toLowerCase() ?? "";
        const walletType =
          connectorName.includes("coinbase") || connectorId.includes("coinbase")
            ? "smart"
            : connectorName.includes("walletconnect") || connectorId.includes("walletconnect")
            ? "base"
            : "extension";

        const result = await authenticateWallet({
          walletAddress: address,
          signature,
          message,
          timestamp,
          walletType,
        });

        login({ token: result.token, user: result.user });
      } catch {
        // Silent fail — user can manually sign in via the auth modal
        attempted.current = false;
      } finally {
        inProgress.current = false;
      }
    })();
  // Reset attempt flag when wallet address changes (different account connected)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isAuthenticated, isReconnecting]);

  // Reset when wallet disconnects so next connect triggers a fresh attempt
  useEffect(() => {
    if (!isConnected) {
      attempted.current = false;
    }
  }, [isConnected]);
}
