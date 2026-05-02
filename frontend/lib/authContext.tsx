import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, getToken, saveToken, clearToken, fetchMe } from "./auth";

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({ user: null, token: null, signIn: () => {}, signOut: () => {}, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) { setLoading(false); return; }
    fetchMe(t)
      .then((u) => { setUser(u); setToken(t); })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signIn = (t: string, u: AuthUser) => { saveToken(t); setToken(t); setUser(u); };
  const signOut = () => { clearToken(); setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, token, signIn, signOut, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
