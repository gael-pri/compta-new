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
    username: user.title ?? user.email,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    role: user.role ?? "user",
    avatar: user.avatar ?? null,
    image: user.avatar ?? null,
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
      const res = await directusClient.request(readUsers({
        fields: ["id", "email", "first_name", "last_name", "role", "avatar", "title"],
      }));
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
    const data: Record<string, any> = {
      email: payload.email || '',
      password: payload.password || '',
      title: payload.username ?? payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: payload.role ?? "user",
      avatar: payload.avatar || payload.image || null,
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
    const data: Record<string, any> = {
      email: user.email || '',
      title: user.username ?? user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role ?? "user",
      avatar: user.image || user.avatar || null,
    };
    // Only include password if explicitly provided
    if (user.password) {
      data.password = user.password;
    }
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

