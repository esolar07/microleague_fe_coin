// SSO Service - Cross-site authentication token exchange
import { API_BASE_URL } from "@/lib/api";

export interface SsoTokenResponse {
  message: string;
  data: {
    ssoToken: string;
  };
}

/**
 * Generate a single-use SSO token for cross-site authentication
 * @param jwt - The current user's JWT token
 * @returns SSO token string
 */
export async function generateSsoToken(jwt: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/sso-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to generate SSO token");
  }

  const result: SsoTokenResponse = await response.json();
  return result.data.ssoToken;
}

/**
 * Redirect to another site with SSO authentication
 * @param targetUrl - The destination URL (e.g., simulation frontend)
 * @param jwt - The current user's JWT token
 */
export async function redirectWithSso(
  targetUrl: string,
  jwt: string,
): Promise<void> {
  try {
    const ssoToken = await generateSsoToken(jwt);
    const separator = targetUrl.includes("?") ? "&" : "?";
    window.open(`${targetUrl}${separator}sso=${ssoToken}`, "_blank");
  } catch (error) {
    console.error("SSO redirect failed:", error);
    // Fallback: redirect without SSO token (user will need to log in)
    window.open(targetUrl, "_blank");
  }
}
