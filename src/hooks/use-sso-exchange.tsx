import { useEffect, useRef } from "react";
import { useAuth } from "./use-auth";
import { API_BASE_URL } from "@/lib/api";
import type { BackendAuthenticatedUser } from "@/lib/backend-auth";

interface SsoExchangeResponse {
  message: string;
  data: {
    user: BackendAuthenticatedUser;
    token: string;
    isNewUser: boolean;
  };
}

/**
 * Hook to handle SSO token exchange on app initialization
 * Checks for ?sso= query parameter and exchanges it for a full auth session
 */
export function useSsoExchange() {
  const { login, isAuthenticated } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Only run once and only if not already authenticated
    if (hasProcessed.current || isAuthenticated) return;
    hasProcessed.current = true;

    const handleSsoExchange = async () => {
      const params = new URLSearchParams(window.location.search);
      const ssoToken = params.get("sso");

      if (!ssoToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/sso-exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ssoToken }),
        });

        if (!response.ok) {
          throw new Error("SSO exchange failed");
        }

        const result: SsoExchangeResponse = await response.json();

        // Store JWT and user state
        login({
          token: result.data.token,
          user: result.data.user,
        });

        // Clean up URL (remove sso parameter)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("sso");
        window.history.replaceState(null, "", newUrl.toString());

        console.log("SSO authentication successful");
      } catch (error) {
        console.error("SSO exchange failed:", error);
        // Token expired or already used — user can log in normally
        // Clean up URL anyway
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("sso");
        window.history.replaceState(null, "", newUrl.toString());
      }
    };

    handleSsoExchange();
  }, [login, isAuthenticated]);
}
