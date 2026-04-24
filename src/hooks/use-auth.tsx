import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import type { BackendAuthenticatedUser } from "@/lib/backend-auth";
import { useAccount } from "wagmi";
import { getCurrentUser } from "@/services/auth";

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

function readStoredAuth(): {
  token: string;
  user: BackendAuthenticatedUser;
} | null {
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
  const hasHandledStoredSession = useRef(false);

  const login = useCallback(
    (params: { token: string; user: BackendAuthenticatedUser }) => {
      setAuth(params);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    },
    [],
  );

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshToken = useCallback(async () => {
    const stored = readStoredAuth();
    if (!stored?.token) return false;
    try {
      const user = await getCurrentUser({ token: stored.token });
      // If refresh succeeds, update the stored auth with fresh user data
      const updatedAuth = { ...stored, user: user as BackendAuthenticatedUser };
      setAuth(updatedAuth);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuth));
      return true;
    } catch (error) {
      // If refresh fails (401), the token is invalid
      return false;
    }
  }, []);

  // Coinbase CDP email/SMS users don't connect via wagmi — their session is
  // managed by the CDP SDK, so we must not require wagmi isConnected for them.
  const isCoinbaseSession = auth?.user?.walletType === "coinbase";

  // Ref that is always current — immune to stale closures in effects triggered
  // by wagmi's synchronous useSyncExternalStore re-renders that can fire before
  // React commits a batch containing the login() setAuth() call.
  const isCoinbaseSessionRef = useRef(isCoinbaseSession);
  isCoinbaseSessionRef.current = isCoinbaseSession;

  // On mount: if there's a stored session but no wallet connected (and wagmi
  // isn't still reconnecting), try to refresh the token for RainbowKit wallets,
  // or clear the session if refresh fails.
  // Skip this check for Coinbase CDP sessions (they don't use wagmi).
  useEffect(() => {
    if (isReconnecting) return;
    if (hasHandledStoredSession.current) return;
    hasHandledStoredSession.current = true;

    const handleStoredSession = async () => {
      if (!auth) return;

      if (isCoinbaseSession) {
        // Coinbase handles its own session persistence
        return;
      }

      if (isConnected) {
        // Wallet is connected, session should be valid
        return;
      }

      // For RainbowKit wallets, try to refresh the token
      const refreshed = await refreshToken();
      if (!refreshed) {
        // Token refresh failed, clear the session
        logout();
      }
    };

    handleStoredSession();
    // Only run once after wagmi settles on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReconnecting]);

  // Auto-logout when wallet disconnects mid-session.
  // Reads isCoinbaseSessionRef (always current) instead of the closure value,
  // so a wagmi synchronous re-render racing with login()'s async batch
  // can never see a stale isCoinbaseSession = false and trigger a spurious logout.
  // Also skips logout while manualSignInProgress is true: the CDP SDK emits
  // transient disconnect events during session setup (refreshAccessToken → signOut),
  // which would fire before login() is committed and cause a spurious logout.
  useEffect(() => {
    if (isCoinbaseSessionRef.current) return;
    if (!manualSignInProgress && wasConnected.current && !isConnected) {
      logout();
    }
    wasConnected.current = isConnected;
  }, [isConnected, logout, manualSignInProgress]);

  // Auto-logout on stale/expired backend JWT (401).
  // Never fires for Coinbase sessions — CDP regularly emits internal 401s
  // (token refresh, sign-in setup) that must not be mistaken for backend 401s.
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      if (manualSignInProgress) return;
      if (isCoinbaseSession) return;
      const msg =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason ?? "");
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        event.preventDefault();
        if (auth) logout();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [auth, isCoinbaseSession, logout, manualSignInProgress]);

  const token = auth?.token ?? null;
  const user = auth?.user ?? null;
  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        login,
        logout,
        setManualSignInProgress,
        manualSignInProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
