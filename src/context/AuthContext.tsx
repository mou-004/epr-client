import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

type AuthResponse = {
  user: User;
  token: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("mini_erp_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("mini_erp_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<{ user: User }>("/auth/me");
        setUser(response.user);
        localStorage.setItem("mini_erp_user", JSON.stringify(response.user));
      } catch {
        localStorage.removeItem("mini_erp_token");
        localStorage.removeItem("mini_erp_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const saveSession = (response: AuthResponse) => {
    localStorage.setItem("mini_erp_token", response.token);
    localStorage.setItem("mini_erp_user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    login: async (email, password) => {
      const response = await api.post<AuthResponse>("/auth/login", { email, password }, false);
      saveSession(response);
    },
    register: async (name, email, password) => {
      const response = await api.post<AuthResponse>("/auth/register", { name, email, password }, false);
      saveSession(response);
    },
    logout: () => {
      localStorage.removeItem("mini_erp_token");
      localStorage.removeItem("mini_erp_user");
      setToken(null);
      setUser(null);
    }
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
