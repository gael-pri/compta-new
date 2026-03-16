import { UserPort } from "@/core/ports/user.port";
import * as xanoApi from "./xano.api";
import { User } from "@/core/types/user";

export interface CreateUserPayload {
  email?: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  image?: string | null;
  role?: string;
}

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

// Mapper Update Xano User → Update domaine User
function mapUserUpdateToXano(payload: Partial<User>) {
  return {
    email: payload.email,
    username: payload.username,
    first_name: payload.firstName,
    last_name: payload.lastName,
    avatar: payload.avatar,
    image: payload.image,
    role: payload.role,
  };
}

// Mapper Create Xano User → domaine
function mapUserCreateToXano(payload: CreateUserPayload) {
  return {
    email: payload.email,
    username: payload.username ?? payload.email,
    first_name: payload.firstName,
    last_name: payload.lastName,
    avatar: payload.avatar,
    image: payload.image,
    role: payload.role ?? "user",
  };
}

export const xanoUserAdapter: UserPort = {

  ///////////
  // Get ALL
  async getAll() {
    const data = await xanoApi.getAllUsers();
    return Array.isArray(data) ? data.map(mapXanoUserToUser) : [];
  },

  /////////////
  // Get by ID
  async getById(id: number) {
    const data = await xanoApi.getUser(id);
    return mapXanoUserToUser(data);
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
  async create(payload) {
    const xanoPayload = mapUserCreateToXano(payload);
    const data = await xanoApi.createUser(xanoPayload);
    return mapXanoUserToUser(data);
  },

  ///////////////////
  // Update a profil
  async update(payload) {
    const { id, ...restPayload } = payload;
    const xanoPayload = mapUserUpdateToXano(restPayload);
    const data = await xanoApi.updateMe(xanoPayload);
    return mapXanoUserToUser(data);
  },

  ///////////////////
  // Delete a profil
  async delete(id: number): Promise<boolean> {
    await xanoApi.deleteUser(id);
    return true;
  },
};
