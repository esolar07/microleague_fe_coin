import { apiFetch } from "@/lib/api";
import { backendAuthenticate, type BackendAuthenticateResult } from "@/lib/backend-auth";

export async function authenticateWallet(params: {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
  walletType: "smart" | "base" | "extension";
  referredBy?: string;
}): Promise<BackendAuthenticateResult> {
  return backendAuthenticate(params);
}

type MeResponse = {
  message: string;
  data: { user: unknown };
};

export async function getCurrentUser(params: {
  token: string;
}): Promise<unknown> {
  const response = await apiFetch<MeResponse>("/auth/refresh", {
    method: "GET",
    authToken: params.token,
  });
  return response.data.user;
}

type ActivityResponse = {
  message: string;
  data: unknown;
};

export async function getUserActivity(params: {
  token: string;
}): Promise<unknown> {
  const response = await apiFetch<ActivityResponse>("/auth/activity", {
    method: "GET",
    authToken: params.token,
  });
  return response.data;
}

