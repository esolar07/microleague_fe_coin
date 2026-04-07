import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import type { BackendAuthenticatedUser } from "@/lib/backend-auth";
import { useAccount } from "wagmi";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: BackendAuthenticatedUser | null;
  login: (params: { token: string; user: BackendAuthenticatedUser }) => void;
  logout: () => void;
  /** Set to true while AuthModal is actively running a sign flow — prevents useAutoAuth from racing */
  setManualSignInProgress: (v: boolean) => void;
  manualSignInProgress: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  setManualSignInProgress: () => {},
  manualSignInProgress: false,
});

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = "mlc-auth";

function readStoredAuth():
  | { token: string; user: BackendAuthenticatedUser }
  | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === "true") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed &&
      "token" in parsed &&
      typeof (parsed as any).token === "string" &&
      "user" in parsed &&
      typeof (parsed as any).user === "object" &&
      (parsed as any).user
    ) {
      return {
        token: (parsed as any).token,
        user: (parsed as any).user as BackendAuthenticatedUser,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [manualSignInProgress, setManualSignInProgress] = useState(false);
  const { isConnected, isReconnecting } = useAccount();
  const wasConnected = useRef(isConnected);

  const login = useCallback(
    (params: { token: string; user: BackendAuthenticatedUser }) => {
      setAuth(params);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    },
    []
  );

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Coinbase CDP email/SMS users don't connect via wagmi — their session is
  // managed by the CDP SDK, so we must not require wagmi isConnected for them.
  const isCoinbaseSession = auth?.user?.walletType === "coinbase";

  // On mount: if there's a stored session but no wallet connected (and wagmi
  // isn't still reconnecting), the session is orphaned — clear it.
  // Skip this check for Coinbase CDP sessions (they don't use wagmi).
  useEffect(() => {
    if (isReconnecting) return;
    if (!isConnected && auth && !isCoinbaseSession) {
      logout();
    }
  // Only run once after wagmi settles on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReconnecting]);

  // Auto-logout when wallet disconnects mid-session.
  // Skip for Coinbase CDP sessions — they don't use wagmi.
  useEffect(() => {
    if (isCoinbaseSession) return;
    if (wasConnected.current && !isConnected) {
      logout();
    }
    wasConnected.current = isConnected;
  }, [isConnected, isCoinbaseSession, logout]);

  // Auto-logout when CDP returns 401 — stale/expired session detected on init
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "");
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        event.preventDefault();
        if (auth) logout();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [auth, logout]);

  const token = auth?.token ?? null;
  const user = auth?.user ?? null;
  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, setManualSignInProgress, manualSignInProgress }}>
      {children}
    </AuthContext.Provider>
  );
};
