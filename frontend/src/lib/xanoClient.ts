// src/lib/xanoClient.ts
const BASE_URL = import.meta.env.VITE_XANO_API_URL;

export async function xanoFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_XANO_API_URL is not configured");
  }
  const token = localStorage.getItem("xano_token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Xano error ${res.status}`);
  }

  return res.json();
}
