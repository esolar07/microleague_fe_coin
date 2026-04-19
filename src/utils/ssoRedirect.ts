/**
 * SSO Redirect Utilities for Vite/React Project
 * Helper functions for generating SSO-enabled cross-site navigation links
 */

import { API_BASE_URL } from "@/lib/api";
import { SIMULATION_FRONTEND_URL } from "@/config/sso";

interface SsoTokenResponse {
  message: string;
  data: {
    ssoToken: string;
  };
}

/**
 * Generate an SSO token from the backend
 */
async function generateSsoToken(jwt: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/sso-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate SSO token: ${response.statusText}`);
    }

    const result: SsoTokenResponse = await response.json();
    return result.data.ssoToken;
  } catch (error) {
    console.error("SSO token generation error:", error);
    throw error;
  }
}

/**
 * Generate an SSO-enabled redirect URL
 *
 * @param targetUrl - The destination URL
 * @param jwt - The current user's JWT token (optional - if not provided, returns plain URL)
 * @returns Complete URL with SSO token if authenticated, or plain URL if not
 */
export async function generateSsoRedirectUrl(
  targetUrl: string,
  jwt?: string | null,
): Promise<string> {
  if (!jwt) {
    // User not authenticated - return plain URL
    return targetUrl;
  }

  try {
    // Generate SSO-enabled URL
    const ssoToken = await generateSsoToken(jwt);
    const separator = targetUrl.includes("?") ? "&" : "?";
    return `${targetUrl}${separator}sso=${ssoToken}`;
  } catch (error) {
    console.error("Failed to generate SSO redirect:", error);
    // Fallback to plain URL if SSO token generation fails
    return targetUrl;
  }
}

/**
 * Redirect to a URL with optional SSO authentication
 *
 * @param targetUrl - The destination URL
 * @param jwt - The current user's JWT token (optional)
 */
export async function redirectWithSso(
  targetUrl: string,
  jwt?: string | null,
): Promise<void> {
  const url = await generateSsoRedirectUrl(targetUrl, jwt);
  window.location.href = url;
}

/**
 * Pre-defined SSO redirect helpers for common destinations
 */
export const ssoRedirects = {
  /**
   * Redirect to simulation frontend - public page (no auth required)
   */
  simulatePublic: async () => {
    window.location.href = `${SIMULATION_FRONTEND_URL}/simulate`;
  },

  /**
   * Redirect to tournament frontend - public page (no auth required)
   */
  tournamentPublic: async () => {
    window.location.href = `${SIMULATION_FRONTEND_URL}/tournament`;
  },

  /**
   * Redirect to simulation with modal (requires auth, uses SSO)
   */
  simulateWithAuth: async (jwt?: string | null) => {
    const url = `${SIMULATION_FRONTEND_URL}/dashboard?modal=simulate`;
    await redirectWithSso(url, jwt);
  },

  /**
   * Redirect to tournament with modal (requires auth, uses SSO)
   */
  tournamentWithAuth: async (jwt?: string | null) => {
    const url = `${SIMULATION_FRONTEND_URL}/dashboard?modal=tournament`;
    await redirectWithSso(url, jwt);
  },

  /**
   * Redirect to dashboard (requires auth, uses SSO)
   */
  dashboard: async (jwt?: string | null) => {
    const url = `${SIMULATION_FRONTEND_URL}/dashboard`;
    await redirectWithSso(url, jwt);
  },
};

/**
 * Smart redirect that chooses the right destination based on authentication status
 *
 * @param type - The type of redirect ('simulate' or 'tournament')
 * @param isAuthenticated - Whether the user is authenticated
 * @param jwt - The user's JWT token (required if authenticated)
 */
export async function smartRedirect(
  type: "simulate" | "tournament",
  isAuthenticated: boolean,
  jwt?: string | null,
): Promise<void> {
  if (isAuthenticated && jwt) {
    // Authenticated: redirect to dashboard with modal
    if (type === "simulate") {
      await ssoRedirects.simulateWithAuth(jwt);
    } else {
      await ssoRedirects.tournamentWithAuth(jwt);
    }
  } else {
    // Not authenticated: redirect to public page
    if (type === "simulate") {
      await ssoRedirects.simulatePublic();
    } else {
      await ssoRedirects.tournamentPublic();
    }
  }
}
