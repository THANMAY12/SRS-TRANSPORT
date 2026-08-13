import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  api,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "../services/api";

const AuthContext = createContext(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const INACTIVITY_WARNING_MS = 14 * 60 * 1000; // 14 minutes (1 min warning)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const logout = useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setInactivityWarning(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  const login = useCallback((newToken, newUser) => {
    setStoredToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setInactivityWarning(false);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    setInactivityWarning(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (user) {
      warningRef.current = setTimeout(() => {
        setInactivityWarning(true);
      }, INACTIVITY_WARNING_MS);

      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [user, logout]);

  // Handle unauthorized events from API calls
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  // Verify initial token
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getCurrentUser();
        setUser(res.user);
      } catch (err) {
        removeStoredToken();
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Listen for user activity for automatic logout
  useEffect(() => {
    if (!user) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();

    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetInactivityTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        inactivityWarning,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
