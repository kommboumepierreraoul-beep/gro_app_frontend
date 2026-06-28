/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialisation directe depuis localStorage (pas de setState dans useEffect)
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // fetchUser déclaré AVANT de l'utiliser
  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect seulement pour le fetch initial
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []); // Exécuté une seule fois

  const login = async (email: string, password: string) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      {
        email,
        password,
      },
    );
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
