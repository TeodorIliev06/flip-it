import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  refresh as apiRefresh,
  logout as apiLogout,
  loginWithGoogle,
  loginWithGitHub,
  type AuthResponse,
} from "./authApi";

export type AuthUser = { userId: number; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  githubLogin: (code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const applyAuthResponse = (res: AuthResponse) => {
    setUser({ userId: res.userId, email: res.email });
    setAccessToken(res.accessToken);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);

    applyAuthResponse(res);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await apiRegister(email, password);
    const res = await apiLogin(email, password);

    applyAuthResponse(res);
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    const res = await loginWithGoogle(idToken);
    applyAuthResponse(res);
  }, []);

  const githubLogin = useCallback(async (code: string) => {
    const res = await loginWithGitHub(code);
    applyAuthResponse(res);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();

    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    const hasRefreshCookie = document.cookie.includes("refreshToken=");
    if (!hasRefreshCookie) return;

    apiRefresh()
      .then(applyAuthResponse)
      .catch(() => {
        setUser(null);
        setAccessToken(null);
      });
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, login, register, logout, googleLogin, githubLogin }),
    [user, accessToken, login, register, logout, googleLogin, githubLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
};
