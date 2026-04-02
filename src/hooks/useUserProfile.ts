import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  verifyEmail,
  resendVerificationEmail,
  updatePreferences,
  uploadAvatar,
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
} from "@/services/userProfile";
import { toast } from "sonner";

// Query keys
export const userProfileKeys = {
  all: ["userProfile"] as const,
  profile: (walletAddress: string) =>
    [...userProfileKeys.all, "profile", walletAddress] as const,
};

// Get user profile hook
export const useUserProfile = (walletAddress: string | undefined) => {
  return useQuery({
    queryKey: userProfileKeys.profile(walletAddress || ""),
    queryFn: () => getProfile(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if user doesn't exist (404)
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

// Create user profile hook
export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserProfileRequest) => createProfile(data),
    onSuccess: (data) => {
      // Update the cache with the new profile
      queryClient.setQueryData(
        userProfileKeys.profile(data.walletAddress),
        data,
      );
      toast.success("Profile created successfully!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to create profile";
      toast.error(message);
    },
  });
};

// Update user profile hook
export const useUpdateUserProfile = (walletAddress: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      updateProfile(walletAddress, data),
    onSuccess: (data) => {
      // Update the cache with the updated profile
      queryClient.setQueryData(userProfileKeys.profile(walletAddress), data);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to update profile";
      toast.error(message);
    },
  });
};

// Delete user profile hook
export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletAddress: string) => deleteProfile(walletAddress),
    onSuccess: (_, walletAddress) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: userProfileKeys.profile(walletAddress),
      });
      toast.success("Profile deleted successfully!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to delete profile";
      toast.error(message);
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
      // Update the cache with the updated profile
      queryClient.setQueryData(userProfileKeys.profile(walletAddress), data);
      toast.success("Preferences updated!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to update preferences";
      toast.error(message);
    },
  });
};

// Verify email hook
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      walletAddress,
      token,
    }: {
      walletAddress: string;
      token: string;
    }) => verifyEmail(walletAddress, token),
    onSuccess: (data) => {
      // Update the cache with the verified profile
      queryClient.setQueryData(
        userProfileKeys.profile(data.walletAddress),
        data,
      );
      toast.success("Email verified successfully!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to verify email";
      toast.error(message);
    },
  });
};

// Resend verification email hook
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (walletAddress: string) =>
      resendVerificationEmail(walletAddress),
    onSuccess: () => {
      toast.success("Verification email sent!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to send verification email";
      toast.error(message);
    },
  });
};

// Upload avatar hook
export const useUploadAvatar = (walletAddress: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(walletAddress, file),
    onSuccess: (data) => {
      // Update the profile in cache with new avatar URL
      queryClient.setQueryData(
        userProfileKeys.profile(walletAddress),
        (oldData: UserProfile | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar: data.avatarUrl };
        },
      );
      toast.success("Avatar updated successfully!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to upload avatar";
      toast.error(message);
    },
  });
};
