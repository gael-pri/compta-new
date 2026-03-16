// src/adapters/supabase/user.adapter.ts
import { supabaseClient } from "@lib/supabaseClient";
import { UserPort } from "@/core/ports/user.port";
import { User } from "@/core/types/user";

// Mapper Supabase User → domaine User
function mapProfileToUser(profile: any): User {
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatar: profile.avatar_url,
    role: profile.role,
    image: profile.image,
  };
}

export const supabaseUserAdapter: UserPort = {

  ///////////
  // Get ALL
  async getAll() {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*");

    if (error) throw error;
    return data.map(mapProfileToUser);
  },

  /////////////
  // Get by ID
  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapProfileToUser(data);
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
    const { data, error } = await supabaseClient
      .from("profiles")
      .insert({
        email: payload.email,
        username: payload.username,
        first_name: payload.firstName,
        last_name: payload.lastName,
        avatar_url: payload.avatar,
        role: payload.role ?? "user",
        image: payload.image,
      })
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error("Create failed");
    }

    return mapProfileToUser(data);
  },

  ///////////////////
  // Update a profil
  async update(payload) {
    const { id, ...user } = payload;

    const { data, error } = await supabaseClient
      .from("profiles")
      .update({
        email: user.email,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.avatar,
        role: user.role,
        image: user.image,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error("Update failed");
    }

    return mapProfileToUser(data);
  },

  ///////////////////
  // Delete a profil
  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseClient
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  },

};
