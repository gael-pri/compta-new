import { User, CreateUserPayload, UpdateUserPayload } from "../types/user";

export interface UserPayload {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: string;
  image?: string;
  avatar?: string;
  password?: string;
}

export interface UserPort {
  getAll(): Promise<User[]>;
  getById(id: string | number): Promise<User | null>;
  getRoles(): Promise<{ id: string; name: string }[]>;
  create(payload: CreateUserPayload): Promise<User>;
  update(payload: UpdateUserPayload): Promise<User>;
  delete(id: string | number): Promise<boolean>;
}
