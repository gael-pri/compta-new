import { createContext, useContext } from "react";

import type { MeQuery } from "../graphql/__generated__/schema";
import { useMe } from "../hooks/useUsers";

type User = MeQuery["me"];

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, error } = useMe();
  const errorMessage = error?.message ?? null;

  return (
    <UserContext.Provider value={{ user, loading, error: errorMessage }}>
      {children}
    </UserContext.Provider>
  );
};
