// core/types/user.ts
export interface User {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  image?: string;
  profileId?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  password?: string;
  username?: string;
  image?: string;
  avatar?: string;
  company?: string;
}

export interface UpdateUserPayload extends CreateUserPayload {
  id: string | number; // obligatoire pour update
}