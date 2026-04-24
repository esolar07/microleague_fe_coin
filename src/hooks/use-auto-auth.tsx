import { useEffect, useRef } from "react";
import { useAccount, useChainId, useSignMessage, useSwitchChain } from "wagmi";
import { useAuth } from "@/hooks/use-auth";
import { authenticateWallet } from "@/services/auth";
import { APP_CHAIN } from "@/config/network";

/**
 * Runs at app root. When a wagmi wallet (MetaMask, Coinbase Wallet extension,
 * WalletConnect, etc.) is connected but has no backend session, silently signs
 * a message to create one — no modal required.
 *
 * CDP email/SMS users are NOT handled here — they go through AuthModal →
 * handleCoinbaseAuth → cdp-hooks signEvmMessage.
 */
export function useAutoAuth() {
  const { address, isConnected, connector, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const { isAuthenticated, user, login, logout, manualSignInProgress } = useAuth();

  const attempted = useRef(false);
  const inProgress = useRef(false);

  useEffect(() => {
    if (isReconnecting) return;
    if (!isConnected || !address) return;
    // CDP embedded wallet users authenticate via AuthModal → handleCoinbaseAuth.
    // If a prior auto-auth run created a wrong "smart" session for this connector,
    // clear it so the user can re-authenticate properly via the modal.
    if (connector?.id === "cdp-embedded-wallet") {
      if (isAuthenticated && user?.walletType === "smart") logout();
      return;
    }
    if (isAuthenticated) return;
    if (inProgress.current) return;
    if (manualSignInProgress) return;
    if (attempted.current) return;

    attempted.current = true;

    (async () => {
      inProgress.current = true;
      try {
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
          connectorName.includes("walletconnect") || connectorId.includes("walletconnect")
            ? "base"
            : connectorName.includes("coinbase") || connectorId.includes("coinbase")
            ? "smart"
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
        attempted.current = false;
      } finally {
        inProgress.current = false;
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isAuthenticated, isReconnecting, manualSignInProgress]);

  useEffect(() => {
    if (!isConnected) {
      attempted.current = false;
    }
  }, [isConnected]);
}
