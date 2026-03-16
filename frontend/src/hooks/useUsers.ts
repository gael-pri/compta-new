// src/hooks/useUsers.ts
import { backend } from "@/core/backend";
import { User, UpdateUserPayload } from "@/core/types/user";
import { useEffect, useState } from "react";

/**
 * Hook: utilisateur courant
 */
export const useMe = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    backend.user
      .me()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
};

/**
 * Hook: tous les utilisateurs
 */
export const useGetAllUsers = (trigger?: number | boolean) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    backend.user
      .getAll()
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [trigger]); // Ajout de trigger comme dépendance

  return { users, loading, error };
};

/**
 * Hook: utilisateur par ID
 */
export const useGetUserById = (id: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    backend.user
      .getById(id)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { userById: user, loading, error };
};

/**
 * Hook: Update user
 */
export const useUsers = () => {
    const updateUser = (payload: UpdateUserPayload) =>
    backend.user.update(payload);

    const createUser = (payload: any) =>
      backend.user.create(payload); // admin only

    const deleteUser = (id: string | number) =>
      backend.user.delete(id);

    return { updateUser, createUser, deleteUser };
};

/**
 * Hook: liste des rôles
 */
export const useRoles = () => {
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    backend.user
      .getRoles()
      .then(setRoles)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading, error };
};
