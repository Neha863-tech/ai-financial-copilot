import { API_BASE_URL } from "./finsightApi";

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

async function authRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("finsight_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  if (!payload) throw new Error("The API returned an invalid response.");
  return (payload.data === undefined ? payload : payload.data) as T;
}

export function registerUser(payload: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ user: import("../types/auth").User; token: string }> {
  return authRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: {
  email: string;
  password: string;
}): Promise<{ user: import("../types/auth").User; token: string }> {
  return authRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyProfile(token: string): Promise<{ user: import("../types/auth").User }> {
  return authRequest("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateMyProfile(
  payload: { fullName?: string; preferredCurrency?: string; timezone?: string },
  token: string
): Promise<{ user: import("../types/auth").User }> {
  return authRequest("/auth/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function logoutUser(): Promise<void> {
  return authRequest("/auth/logout", { method: "POST" });
}
