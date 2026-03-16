import { AuthPort } from "@/core/ports/auth.port";
import { directusClient } from "@lib/directusClient";
import { readMe } from "@directus/sdk";
import { User } from "@/core/types/user";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

// Mapper Directus User → domaine User
function mapDirectusUserToUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    username: user.title ?? user.email,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    role: user.role ?? "user",
    avatar: user.avatar ?? null,
    image: user.avatar ?? null,
  };
}

export const directusAuthAdapter: AuthPort = {

  /////////
  // Login
  async login(email: string, password: string) {
    await directusClient.login({ email, password });
    const user = await directusClient.request(readMe({ fields: ["id", "email", "first_name", "last_name", "role", "avatar", "title"] }));
    return mapDirectusUserToUser(user);
  },

  //////////
  // Logout
  async logout() {
    await directusClient.logout();
    localStorage.removeItem("directus_auth");
  },

  //////////
  // Get Me
  async me() {
    try {
      const user = await directusClient.request(readMe({ fields: ["id", "email", "first_name", "last_name", "role", "avatar", "title"] }));
      return mapDirectusUserToUser(user);
    } catch {
      return null;
    }
  },

  ///////////
  // Sign up
  async signup(payload) {
    await fetch(`${BACKEND_URL}/directus/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: 'd38d1dae-c3b3-4a23-bae1-399c3bc8b028',
      }),
    });
  },

  //////////////////////
  // Forgotten password
  async forgottenPassword(email: string): Promise<void> {
    await fetch(`${BACKEND_URL}/directus/forgotten-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  //////////////////////
  // Reset Password
  async resetPassword(password: string): Promise<void> {
    await fetch(`${BACKEND_URL}/directus/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
  },

  //////////////
  // Invite user
  async inviteUser(email: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/directus/invite-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to invite user");
    }
  }
};
