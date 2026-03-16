// src/adapters/graphql/auth.adapter.ts
import { apolloClient } from "@lib/apolloClient";
import { AuthPort } from "@/core/ports/auth.port";
import { LOGIN_MUTATION, LOGOUT_MUTATION, CREATE_ACCOUNT_MUTATION } from "@graphql/mutations/user";
import { ME_QUERY } from "@graphql/queries/user";
import { User, SignupPayload } from "@/core/types/user";

// Mapper GraphQL User → domaine User
function mapGraphqlUserToUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    avatar: u.profile?.avatar_url ?? u.avatar,
    role: u.role,
    image: u.image,
    profileId: u.profile?.id,
  };
}

export const graphqlAuthAdapter: AuthPort = {

  /////////
  // Login
  async login(email: string, password: string) {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password },
    });

    const gqlUser = data?.login?.user;

    if (!gqlUser) {
      throw new Error("Login failed");
    }

    return mapGraphqlUserToUser(gqlUser);
  },

  //////////
  // Logout
  async logout(): Promise<void> {
    await apolloClient.mutate({ mutation: LOGOUT_MUTATION });
  },

  //////////
  // Get Me
  async me(): Promise<User | null> {
    const { data } = await apolloClient.query({
      query: ME_QUERY,
      fetchPolicy: "network-only",
    });

    return data?.me ? mapGraphqlUserToUser(data.me) : null;
  },

  ///////////
  // Sign up
   async signup(payload: SignupPayload) {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_ACCOUNT_MUTATION,
      variables: {
        data: {
          email: payload.email,
          password: payload.password,
          firstName: payload.firstName,
          lastName: payload.lastName,
        },
      },
    });

    const gqlUser = data?.createAccount;
    if (!gqlUser) {
      throw new Error("Signup failed");
    }

    return mapGraphqlUserToUser(gqlUser);
  },

  //////////////////////
  // Forgotten Password
  async forgottenPassword(email: string): Promise<void> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:44000";
    await fetch(`${backendUrl}/email/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  //////////////////////
  // Reset Password
  async resetPassword(password: string, token?: string): Promise<void> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:44000";
    const res = await fetch(`${backendUrl}/email/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de la réinitialisation");
    }
  },

  //////////////////
  // Invite user
  async inviteUser(email: string): Promise<void> {
    
  },
};
