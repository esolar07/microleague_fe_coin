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

export interface CreateUserProfileRequest {
  email: string;
  displayName: string;
  walletAddress: string;
  bio?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    twoFactor: boolean;
  };
}

export interface UpdateUserProfileRequest {
  email?: string;
  displayName?: string;
  bio?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    twoFactor?: boolean;
  };
}

type UserProfileResponse = {
  message: string;
  data: { profile: UserProfile };
};

type CreateProfileResponse = {
  message: string;
  data: { profile: UserProfile };
};

type UploadAvatarResponse = {
  message: string;
  data: { avatarUrl: string };
};

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// User Profile API functions
export async function getProfile(walletAddress: string): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}`,
    {
      method: "GET",
      authToken: getAuthToken(),
    },
  );
  return response.data.profile;
}

export async function createProfile(
  data: CreateUserProfileRequest,
): Promise<UserProfile> {
  const response = await apiFetch<CreateProfileResponse>("/users/profile", {
    method: "POST",
    authToken: getAuthToken(),
    json: data,
  });
  return response.data.profile;
}

export async function updateProfile(
  walletAddress: string,
  data: UpdateUserProfileRequest,
): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}`,
    {
      method: "PUT",
      authToken: getAuthToken(),
      json: data,
    },
  );
  return response.data.profile;
}

export async function deleteProfile(walletAddress: string): Promise<void> {
  await apiFetch(`/users/profile/${walletAddress}`, {
    method: "DELETE",
    authToken: getAuthToken(),
  });
}

export async function verifyEmail(
  walletAddress: string,
  token: string,
): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}/verify-email`,
    {
      method: "POST",
      authToken: getAuthToken(),
      json: { token },
    },
  );
  return response.data.profile;
}

export async function resendVerificationEmail(
  walletAddress: string,
): Promise<void> {
  await apiFetch(`/users/profile/${walletAddress}/resend-verification`, {
    method: "POST",
    authToken: getAuthToken(),
  });
}

export async function updatePreferences(
  walletAddress: string,
  preferences: UserProfile["preferences"],
): Promise<UserProfile> {
  const response = await apiFetch<UserProfileResponse>(
    `/users/profile/${walletAddress}/preferences`,
    {
      method: "PATCH",
      authToken: getAuthToken(),
      json: { preferences },
    },
  );
  return response.data.profile;
}

export async function uploadAvatar(
  walletAddress: string,
  file: File,
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await apiFetch<UploadAvatarResponse>(
    `/users/profile/${walletAddress}/avatar`,
    {
      method: "POST",
      authToken: getAuthToken(),
      body: formData,
    },
  );
  return response.data;
}
