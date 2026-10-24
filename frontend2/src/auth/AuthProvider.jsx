import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authStorage } from "../services/auth/authStorage";
import { getCurrentUserProfile, loginUser, logoutUser, registerUser } from "../services/auth/authService";
import { isAdminRole, MAIN_ADMIN_ROLE, USER_ROLE } from "./roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getCurrentUserProfile(token);
      setUser(profile);
    } catch (err) {
      console.warn("Failed to restore session:", err);
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleAuthExpired = () => {
      authStorage.clearToken();
      setUser(null);
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user: userProfile } = await loginUser(email, password);
      setUser(userProfile);
      return userProfile;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: isAdminRole(user?.role),
      isParticipant: user?.role === USER_ROLE,
      isMainAdmin: user?.role === MAIN_ADMIN_ROLE,
      loading,
      login,
      logout,
      register,
      refreshUser: restoreSession,
    }),
    [user, loading, login, logout, register, restoreSession]
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
