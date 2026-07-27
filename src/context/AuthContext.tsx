"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
      return match ? decodeURIComponent(match[2]) : null;
    };
    let storedToken = localStorage.getItem("token") || getCookie("token");
    let storedUser = localStorage.getItem("user") || getCookie("user");
    if (storedToken && storedUser) {
      localStorage.setItem("token", storedToken);
      localStorage.setItem("user", storedUser);
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    document.cookie = `token=${newToken}; path=/; max-age=${60*60*24*7}`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(newUser))}; path=/; max-age=${60*60*24*7}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "user=; path=/; max-age=0";
    // Clear NextAuth cookies in case admin logged in via /login
    document.cookie = "next-auth.session-token=; path=/; max-age=0";
    document.cookie = "next-auth.callback-url=; path=/; max-age=0";
    document.cookie = "next-auth.csrf-token=; path=/; max-age=0";
  };

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
