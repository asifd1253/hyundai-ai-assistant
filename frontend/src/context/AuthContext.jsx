import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // CHECK AUTHENTICATION
  const checkAuth = async () => {
    try {
      const response = await api.get("/users/profile");

      setUser(response.data.user);
    } catch (error) {
      setUser(null);

      if (error.response?.status !== 401) {
        console.error("Authentication check failed:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);

    return response.data;
  };

  // REGISTER
  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  // CHECK AUTH WHEN APP LOADS
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
