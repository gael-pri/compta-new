// src/lib/directusClient.ts
import { createDirectus, rest, authentication } from "@directus/sdk";
import type { AuthenticationData } from "@directus/sdk";

export const STORAGE_KEY = "directus_auth";

export const storage = {
  get: async (): Promise<AuthenticationData | null> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: async (value: AuthenticationData | null) => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};

const directusUrl = import.meta.env.VITE_DIRECTUS_URL;

export const directusClient = directusUrl
  ? createDirectus(directusUrl).with(rest()).with(authentication("json", { storage }))
  : (null as any);
