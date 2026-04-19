// SSO Configuration - Cross-site authentication URLs

/**
 * Simulation frontend base URL
 * Update this based on environment
 */
export const SIMULATION_FRONTEND_URL =
  import.meta.env.VITE_SIMULATION_URL ||
  "https://staging.microleaguesports.com";

/**
 * SSO-enabled URLs for cross-site navigation
 */
export const SSO_URLS = {
  simulation: {
    dashboard: `${SIMULATION_FRONTEND_URL}/dashboard`,
    simulate: `${SIMULATION_FRONTEND_URL}/dashboard?modal=simulate`,
    tournament: `${SIMULATION_FRONTEND_URL}/dashboard?modal=tournament`,
  },
} as const;
