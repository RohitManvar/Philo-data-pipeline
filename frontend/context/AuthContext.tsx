import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, getToken, saveToken, clearToken, fetchMe } from "../lib/auth";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signin: (token: string, user: AuthUser) => void;
  signout: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, signin: () => {}, signout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetchMe(token)
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signin = (token: string, u: AuthUser) => {
    saveToken(token);
    setUser(u);
  };

  const signout = () => {
    clearToken();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, signin, signout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
