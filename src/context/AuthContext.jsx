import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "./ConvexClientContext";

const AuthContext = createContext(null);
const TOKEN_KEY = "agriconnect_session_token";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY) || "session_user_farmer_1"; // Default to Raj Kumar for instant live preview if no token
    }
    return "session_user_farmer_1";
  });

  const currentUser = useQuery("users:getCurrentUser", { token: token || undefined });
  const loginMutation = useMutation("users:login");
  const registerMutation = useMutation("users:register");
  const logoutMutation = useMutation("users:logout");

  const saveToken = useCallback((newToken) => {
    setToken(newToken);
    if (typeof window !== "undefined") {
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await loginMutation({ email, password });
      if (res && res.token) {
        saveToken(res.token);
        return res;
      }
    },
    [loginMutation, saveToken]
  );

  const register = useCallback(
    async (formData) => {
      const res = await registerMutation(formData);
      if (res && res.token) {
        saveToken(res.token);
        return res;
      }
    },
    [registerMutation, saveToken]
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch (e) {
        console.error("Logout err:", e);
      }
    }
    saveToken(null);
  }, [token, logoutMutation, saveToken]);

  // Quick switch for demo and test evaluation across accounts
  const switchDemoAccount = useCallback(
    (accountType) => {
      let targetToken = null;
      if (accountType === "farmer_raj") {
        targetToken = "session_user_farmer_1";
      } else if (accountType === "farmer_priya") {
        targetToken = "session_user_farmer_2";
      } else if (accountType === "company_abc") {
        targetToken = "session_user_company_1";
      } else if (accountType === "company_greenfresh") {
        targetToken = "session_user_company_2";
      } else if (accountType === "admin") {
        targetToken = "session_user_admin_1";
      }
      if (targetToken) {
        saveToken(targetToken);
      }
    },
    [saveToken]
  );

  const value = {
    token,
    user: currentUser,
    role: currentUser?.role || null,
    profile: currentUser?.profile || null,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    switchDemoAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
