import { QueryClient } from "@tanstack/react-query";

/**
 * Comprehensive logout utility that clears all application state
 * - Clears localStorage
 * - Clears sessionStorage
 * - Clears all cookies
 * - Clears React Query cache
 */
export async function performCompleteLogout(
  queryClient: QueryClient,
): Promise<void> {
  // Clear all localStorage
  localStorage.clear();

  // Clear all sessionStorage
  sessionStorage.clear();

  // Clear all cookies
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    // Clear cookie for current domain and path
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

    // Also try to clear for root domain
    const domain = window.location.hostname;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;

    // Try parent domain (e.g., .example.com)
    const parts = domain.split(".");
    if (parts.length > 2) {
      const parentDomain = "." + parts.slice(-2).join(".");
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
    }
  }

  // Clear React Query cache
  queryClient.clear();

  // Also remove all queries from cache
  queryClient.removeQueries();
}
