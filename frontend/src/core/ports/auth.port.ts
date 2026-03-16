// src/core/ports/auth.port.ts
import { User, SignupPayload } from "@/core/types/user";

export interface AuthPort {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  me(): Promise<User | null>;

  signup(payload: SignupPayload): Promise<any>;
  forgottenPassword(email: string): Promise<void>;
  resetPassword(password: string, token?: string): Promise<void>;
  inviteUser(email: string): Promise<void>;
}
