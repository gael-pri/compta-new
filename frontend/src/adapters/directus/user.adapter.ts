// src/adapters/directus/user.adapter.ts
import { directusClient } from "@lib/directusClient";
import { createUser, updateUser, deleteUser, readItems, readItem, readUsers, readRoles } from "@directus/sdk";

import { UserPort } from "@/core/ports/user.port";
import { User } from "@/core/types/user";

interface DirectusUserInput {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  avatar?: string | null;
  image?: string | null;
  username?: string | null;
}

// Mapper Directus User → domaine User
function mapDirectusUserToUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username ?? user.email,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    role: user.role ?? "user",
    avatar: user.avatar ?? null,
    image: user.image ?? null,
  };
}

// Mapper Directus Role → domaine Role
function mapDirectusRoleToRole(role: any): { id: string; name: string } {
  return {
    id: role.id,
    name: role.name || "unknown",
  };
}

export const directusUserAdapter: UserPort = {

  ///////////
  // Get ALL
   async getAll() {
    try {
      const res = await directusClient.request(readUsers());
      return res?.map(mapDirectusUserToUser) ?? [];
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  },

  /////////////
  // Get by ID
  async getById(id: string | number) {
    const res = await directusClient.request(readItem("users", String(id)));
    return res ? mapDirectusUserToUser(res) : null;
  },

  ///////////////////
  // Get roles list
  async getRoles() {
    const roles = await directusClient.request(readRoles());
    return roles.map(mapDirectusRoleToRole);
  },

  ///////////////////
  // Create a profil
  async create(payload) {
    const data: DirectusUserInput = {
      email: payload.email || '',
      password: payload.password || '',
      username: payload.username ?? payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: payload.role ?? "user",
      avatar: payload.avatar,
      image: payload.image,
    };

    const res = await directusClient.request(
      createUser(data as any)
    );

    return mapDirectusUserToUser(res);
  },

  ///////////////////
  // Update a profil
  async update(payload) {
    const { id, ...user } = payload;
    const data: DirectusUserInput = {
      email: user.email || '',
      password: user.password || '',
      username: user.username ?? user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role ?? "user",
      avatar: user.avatar,
      image: user.image,
    };
    const res = await directusClient.request(
      updateUser(String(id), data as any)
    );
    return mapDirectusUserToUser(res);
  },

  ///////////////////
  // Delete a profil
  async delete(id: string | number) {
    await directusClient.request(deleteUser(String(id)));
    return true;
  },
};

