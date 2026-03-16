// src/lib/authManager.ts
export const AUTH_STORAGE_KEY = "auth_token";

export function setToken(token: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
}

export function getToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function clearToken() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
