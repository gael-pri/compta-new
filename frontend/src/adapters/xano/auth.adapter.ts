// src/adapters/xano/auth.adapter.ts
import { AuthPort } from "@/core/ports/auth.port";
import { login as xanoLogin, me as xanoMe, signup as xanoSignup } from "./xano.api";
import { User, SignupPayload } from "@/core/types/user";

// Mapper Xano User → domaine User
function mapXanoUserToUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username ?? u.email,
    firstName: u.first_name ?? u.firstName ?? null,
    lastName: u.last_name ?? u.lastName ?? null,
    role: u.role ?? "user",
    avatar: u.avatar ?? null,
    image: u.image ?? null,
  };
}

export const xanoAuthAdapter: AuthPort = {

  /////////
  // Login
  async login(email: string, password: string) {
    const res = await xanoLogin(email, password);

    if (res.authToken) {
      localStorage.setItem("xano_token", res.authToken);
    }

    const rawUser = res.user ?? res;

    if (!rawUser) {
      throw new Error("Login succeeded but no user was returned");
    }
    return mapXanoUserToUser(rawUser);
  },

  //////////
  // Logout
  async logout() {
    localStorage.removeItem("xano_token");
  },

  //////
  // Me
  async me() {
    try {
      const user = await xanoMe();
      return mapXanoUserToUser(user);
    } catch {
      return null;
    }
  },

  ///////////
  // Sign up
  async signup(payload: SignupPayload) {
    const { email, password, firstName, lastName } = payload;
    const res = await xanoSignup(email, password, firstName || '', lastName || '');

    if (res.authToken) {
      localStorage.setItem("xano_token", res.authToken);
    }

    const rawUser = res.user ?? res;

    if (!rawUser) {
      throw new Error("Signup succeeded but no user was returned");
    }
    return mapXanoUserToUser(rawUser);
  },

  //////////////////////
  // Forgotten Password
  async forgottenPassword(email: string): Promise<void> {
      
  },

  //////////////////////
  // Reset Password
  async resetPassword(password: string): Promise<void> {
    
  },

  //////////////////
  // Invite user
  async inviteUser(email: string): Promise<void> {
    
  },
};
