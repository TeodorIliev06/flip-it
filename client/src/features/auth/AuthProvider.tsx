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
  type LoginResponse,
} from "./authApi";

export type AuthUser = { userId: number; email: string; username: string };

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
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

  const applyLoginResponse = (res: LoginResponse) => {
    setUser({ userId: res.userId, email: res.email, username: res.username });
    setAccessToken(res.accessToken);
  };

  const applyAuthResponse = (res: AuthResponse) => {
    // The user state should already be set from a previous login
    setAccessToken(res.accessToken);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);

    applyLoginResponse(res);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await apiRegister(username, email, password);
    const res = await apiLogin(email, password);

    applyLoginResponse(res);
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    const res = await loginWithGoogle(idToken);
    applyLoginResponse(res);
  }, []);

  const githubLogin = useCallback(async (code: string) => {
    const res = await loginWithGitHub(code);
    applyLoginResponse(res);
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
