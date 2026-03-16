// src/adapters/graphql/user.adapter.ts
import { apolloClient } from "@lib/apolloClient";
import { UserPort } from "@/core/ports/user.port";
import { User } from "@/core/types/user";
import { GET_ALL_USERS, GET_USER_BY_ID } from "@graphql/queries/user";
import { CREATE_ACCOUNT_MUTATION, UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from "@graphql/mutations/user";

// Mapper GraphQL User → domaine User
function mapGraphqlUserToUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    avatar: u.avatar,
    role: u.role,
    image: u.image,
  };
}

export const graphqlUserAdapter: UserPort = {

  ///////////
  // Get ALL
  async getAll(): Promise<User[]> {
    const { data } = await apolloClient.query({
      query: GET_ALL_USERS,
    });

    return (data?.getAllUsers ?? []).map(mapGraphqlUserToUser);
  },

  /////////////
  // Get by ID
  async getById(id: number): Promise<User | null> {
    const { data } = await apolloClient.query({
      query: GET_USER_BY_ID,
      variables: { id },
    });

    return data?.getUserById ? mapGraphqlUserToUser(data.getUserById) : null;
  },

  ///////////
  // Get rôles
  async getRoles() {
    return [
      {id: "1", name: "admin"}
    ];
  },

  ///////////////////
  // Create a profil
  async create(payload): Promise<User> {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_ACCOUNT_MUTATION,
      variables: { data: payload },
    });

    if (!data?.createUser) {
      throw new Error("Create failed");
    }

    return mapGraphqlUserToUser(data.createUser);
  },

  ///////////////////
  // Update a profil
  async update(payload) {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_USER_MUTATION,
      variables: { data: payload },
    });

    if (!data?.updateUser) { throw new Error("Update failed"); }

    return mapGraphqlUserToUser(data.updateUser);
  },

  ///////////////////
  // Delete a profil
  async delete(id: number): Promise<boolean> {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_USER_MUTATION,
      variables: { id },
    });

    if (data?.deleteUser !== true) {
      throw new Error("Delete failed");
    }

    return true;
  },
};
