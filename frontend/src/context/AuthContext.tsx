// src/context/AuthContext.tsx
import { createContext, useContext } from "react";
import { User, SignupPayload } from "@/core/types/user";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: unknown;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (payload: SignupPayload) => Promise<User>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
};
