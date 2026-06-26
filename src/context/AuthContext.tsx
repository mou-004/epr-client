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

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem("mini_erp_user");

    if (!raw || raw === "undefined" || raw === "null") {
      localStorage.removeItem("mini_erp_user");
      return null;
    }

    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("mini_erp_user");
    return null;
  }
};

const getStoredToken = (): string | null => {
  const token = localStorage.getItem("mini_erp_token");

  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("mini_erp_token");
    return null;
  }

  return token;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ user: User }>("/auth/me");

        if (response?.user) {
          setUser(response.user);
          localStorage.setItem("mini_erp_user", JSON.stringify(response.user));
        }
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
    if (!response?.token || !response?.user) {
      throw new Error("Invalid login response");
    }

    localStorage.setItem("mini_erp_token", response.token);
    localStorage.setItem("mini_erp_user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,

      login: async (email, password) => {
        const response = await api.post<AuthResponse>(
          "/auth/login",
          { email, password },
          false
        );
        saveSession(response);
      },

      register: async (name, email, password) => {
        const response = await api.post<AuthResponse>(
          "/auth/register",
          { name, email, password },
          false
        );
        saveSession(response);
      },

      logout: () => {
        localStorage.removeItem("mini_erp_token");
        localStorage.removeItem("mini_erp_user");
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
