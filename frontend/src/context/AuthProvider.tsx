// src/context/AuthProvider.tsx
import { useEffect, useState } from "react";
import { backend } from "@/core/backend";
import { AuthContext } from "./AuthContext";
import { User, SignupPayload } from "@/core/types/user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await backend.auth.me();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await backend.auth.login(email, password);
      // Re-fetch full user data (including profileId) after login
      const fullUser = await backend.auth.me();
      setUser(fullUser);
      return fullUser!;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await backend.auth.logout();
    setUser(null);
  };

  const signup = async (payload: SignupPayload): Promise<User> => {
  setLoading(true);
  try {
    const u = await backend.auth.signup(payload);
    return u;
  } catch (e) {
    setError(e);
    throw e;
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}
