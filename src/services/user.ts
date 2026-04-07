import { apiFetch } from "@/lib/api";

type ProfileResponse = {
  message: string;
  data: { profile: unknown };
};

export async function getProfile(params: { token: string }): Promise<unknown> {
  const response = await apiFetch<ProfileResponse>("/user/profile", {
    method: "GET",
    authToken: params.token,
  });
  return response.data.profile;
}

export async function updateProfile(params: {
  token: string;
  profile: Record<string, unknown>;
}): Promise<unknown> {
  const response = await apiFetch<ProfileResponse>("/user/profile", {
    method: "PUT",
    authToken: params.token,
    json: params.profile,
  });
  return response.data.profile;
}

