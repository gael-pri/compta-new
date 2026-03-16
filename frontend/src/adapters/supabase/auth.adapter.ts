// src/adapters/supabase/user.adapter.ts
import { supabaseClient } from "@lib/supabaseClient";
import { AuthPort } from "@/core/ports/auth.port";
import type { User, SignupPayload } from "@/core/types/user";

// Mapper Supabase User → domaine User
function mapSupabaseUserToUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    username: supabaseUser.user_metadata?.username ?? supabaseUser.email ?? "",
    firstName: supabaseUser.user_metadata?.firstName ?? null,
    lastName: supabaseUser.user_metadata?.lastName ?? null,
    role: supabaseUser.user_metadata?.role ?? "user",
    avatar: supabaseUser.user_metadata?.avatar ?? null,
    image: supabaseUser.user_metadata?.image ?? null,
  };
}

export const supabaseAuthAdapter: AuthPort = {

  /////////
  // Login
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error ?? new Error("Login failed");
    return mapSupabaseUserToUser(data.user);
  },

  //////////
  // Logout
  async logout(): Promise<void> {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  //////
  // Me
  async me(): Promise<User | null> {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) return null;
    return user ? mapSupabaseUserToUser(user) : null;
  },

  ///////////
  // Sign up
  async signup(payload: SignupPayload): Promise<User> {
    const { email, password, firstName, lastName } = payload;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          role: "user",
        },
      },
    });

    if (error || !data.user) {
      throw error ?? new Error("Signup failed");
    }

    return mapSupabaseUserToUser(data.user);
  },

  //////////////////////
  // Forgotten Password
  async forgottenPassword(email: string): Promise<void> {
    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    if (error) throw error;
  },

  //////////////////////
  // Reset Password
  async resetPassword(password: string): Promise<void> {
    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(password, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    if (error) throw error;
  },

  //////////////////
  // Invite user
  async inviteUser(email: string): Promise<void> {
    const { error } =
      await supabaseClient.auth.admin.inviteUserByEmail(email);

    if (error) throw error;
  },
};
