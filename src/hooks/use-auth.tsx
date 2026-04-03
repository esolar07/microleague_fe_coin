import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import type { BackendAuthenticatedUser } from "@/lib/backend-auth";
import { useAccount } from "wagmi";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: BackendAuthenticatedUser | null;
  login: (params: { token: string; user: BackendAuthenticatedUser }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
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
  const { isConnected } = useAccount();
  // Track previous connection state to detect disconnects
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

  // Auto-logout when wallet disconnects (Coinbase session ends, user disconnects, etc.)
  useEffect(() => {
    if (wasConnected.current && !isConnected && auth) {
      logout();
    }
    wasConnected.current = isConnected;
  }, [isConnected, auth, logout]);

  const token = auth?.token ?? null;
  const user = auth?.user ?? null;
  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
