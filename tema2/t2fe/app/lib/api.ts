export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  [key: string]: unknown;
} & T;

const API_BASE_URL =
  "http://localhost:4000";
  // || process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => ({
    success: false,
    message: "Invalid JSON response from server.",
  }))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export type AppUser = {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
};

export type EventItem = {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  description: string;
  recurrence: "weekly" | "once";
  lat: number | null;
  lng: number | null;
};