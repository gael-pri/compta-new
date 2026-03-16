// src/adapters/xano/xano.api.ts
import { xanoFetch } from "@lib/xanoClient";
import { XanoAuthResponse, XanoMeResponse } from "./xano.types";

// Auth
export function me(): Promise<XanoMeResponse> {
  return xanoFetch("/auth/me");
}

export function login(email: string, password: string): Promise<XanoAuthResponse> {
  return xanoFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<any> {
  return xanoFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    }),
  });
}

export function logout(): Promise<void> {
  return xanoFetch("/auth/logout", { method: "POST" });
}

// Get Users
export function getAllUsers(): Promise<XanoMeResponse> {
  return xanoFetch("/users");
}

export function getUser(id: number): Promise<XanoMeResponse> {
  return xanoFetch(`/users/${id}`);
}

// CRUD users
export function createUser(payload: any): Promise<XanoMeResponse> {
  return xanoFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMe(payload: any) {
  return xanoFetch("/user/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: number): Promise<void> {
  return xanoFetch(`/users/${id}`, {
    method: "DELETE",
  });
}

// Features
export function getAllFeatures(): Promise<any[]> {
  return xanoFetch("/features");
}

