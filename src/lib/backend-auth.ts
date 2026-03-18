import { apiFetch } from "@/lib/api";

export type BackendWalletTypeName = "smart" | "base" | "extension";

export interface BackendUserProfileData {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendAuthenticatedUser {
  id: string;
  referralId: string;
  walletAddress: string;
  walletType: BackendWalletTypeName;
  createdAt: string;
  profile: BackendUserProfileData | null;
}

export interface BackendAuthenticateResult {
  user: BackendAuthenticatedUser;
  token: string;
  isNewUser: boolean;
}

type BackendAuthenticateResponse = {
  message: string;
  data: BackendAuthenticateResult;
};

export async function backendAuthenticate(params: {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
  walletType: BackendWalletTypeName;
  referredBy?: string;
}): Promise<BackendAuthenticateResult> {
  const response = await apiFetch<BackendAuthenticateResponse>(
    "/auth/authenticate",
    {
      method: "POST",
      json: params,
    }
  );

  return response.data;
}

