import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  uploadAvatar,
  UserProfile,
  UpdateUserProfileRequest,
} from "@/services/userProfile";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import type { BackendAuthenticatedUser } from "@/lib/backend-auth";

const withAvatarCacheBuster = (avatarUrl: string) => {
  if (
    avatarUrl.startsWith("data:") ||
    avatarUrl.startsWith("blob:")
  ) {
    return avatarUrl;
  }

  const separator = avatarUrl.includes("?") ? "&" : "?";
  return `${avatarUrl}${separator}t=${Date.now()}`;
};

// Query keys
export const userProfileKeys = {
  all: ["userProfile"] as const,
  profile: (walletAddress: string) =>
    [...userProfileKeys.all, "profile", walletAddress] as const,
};

// Get user profile hook
export const useUserProfile = (walletAddress: string | undefined) => {
  return useQuery<UserProfile>({
    queryKey: userProfileKeys.profile(walletAddress || ""),
    queryFn: () => getProfile(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("not found")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Update user profile hook
export const useUpdateUserProfile = (walletAddress: string) => {
  const queryClient = useQueryClient();
  const { login, user, token } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      updateProfile(walletAddress, data),
    onSuccess: ({ profile, newToken }) => {
      queryClient.setQueryData(userProfileKeys.profile(walletAddress), profile);
      // If accounts were merged, the backend issued a new token — re-login
      if (newToken && user) {
        login({ token: newToken, user: user as BackendAuthenticatedUser });
        toast.success("Profile saved and accounts linked!");
      } else {
        toast.success("Profile updated successfully!");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update profile");
    },
  });
};

// Update preferences hook
export const useUpdatePreferences = (walletAddress: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: UserProfile["preferences"]) =>
      updatePreferences(walletAddress, preferences),
    onSuccess: (data) => {
      queryClient.setQueryData(userProfileKeys.profile(walletAddress), data);
      toast.success("Preferences updated!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update preferences");
    },
  });
};

// Upload avatar hook
export const useUploadAvatar = (walletAddress: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(walletAddress, file),
    onMutate: async (file: File) => {
      const previewUrl = URL.createObjectURL(file);
      const queryKey = userProfileKeys.profile(walletAddress);

      await queryClient.cancelQueries({ queryKey });

      const previousProfile = queryClient.getQueryData<UserProfile>(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData: UserProfile | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar: previewUrl };
        },
      );

      return { previousProfile, previewUrl, queryKey };
    },
    onSuccess: (data, _file, context) => {
      const avatarUrl = withAvatarCacheBuster(data.avatarUrl);

      queryClient.setQueryData(
        context?.queryKey ?? userProfileKeys.profile(walletAddress),
        (oldData: UserProfile | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar: avatarUrl };
        },
      );
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }
      toast.success("Avatar updated successfully!");
    },
    onError: (error: any, _file, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousProfile);
      }
      if (context?.previewUrl) {
        URL.revokeObjectURL(context.previewUrl);
      }
      toast.error(error?.message || "Failed to upload avatar");
    },
  });
};
