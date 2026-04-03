import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id?: string;
  email: string;
  displayName: string;
  walletAddress: string;
  avatar?: string;
  bio: string;
  joinedDate: string;
  isEmailVerified: boolean;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    twoFactor: boolean;
  };
}

export interface UpdateUserProfileRequest {
  email?: string;
  displayName?: string;
  bio?: string;
}

type UserProfileResponse = {
  message: string;
  data: { profile: UserProfile };
};

type UploadAvatarResponse = {
  message: string;
  data: { avatarUrl: string };
};

// Read the JWT token from the same storage key the AuthProvider uses
const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem("mlc-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
};

export async function getProfile(walletAddress: string): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}`,
    { method: "GET", authToken: getAuthToken() },
  );
  return response.data.profile;
}

export async function updateProfile(
  walletAddress: string,
  data: UpdateUserProfileRequest,
): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}`,
    { method: "PUT", authToken: getAuthToken(), json: data },
  );
  return response.data.profile;
}

export async function updatePreferences(
  walletAddress: string,
  preferences: UserProfile["preferences"],
): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}/preferences`,
    { method: "PATCH", authToken: getAuthToken(), json: { preferences } },
  );
  return response.data.profile;
}

export async function uploadAvatar(
  walletAddress: string,
  file: File,
): Promise<{ avatarUrl: string }> {
  // Convert file to a data URL for the simple avatar endpoint
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await apiFetch<UploadAvatarResponse>(
    `/users/profile/${walletAddress}/avatar`,
    { method: "POST", authToken: getAuthToken(), json: { avatarUrl: dataUrl } },
  );
  return response.data;
}
