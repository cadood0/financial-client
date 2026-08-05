"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/constants/routes";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth-token";
import { getMe, login as loginRequest } from "@/services/auth.service";
import type { LoginRequest, User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest, rememberDevice?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }

    const me = await getMe();
    setUser(me);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const token = getAccessToken();
        if (!token) {
          if (!cancelled) setUser(null);
          return;
        }
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        clearAccessToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginRequest, rememberDevice = true) => {
      const result = await loginRequest(payload);
      setAccessToken(result.access_token, rememberDevice);
      setUser(result.user);
      router.replace(routes.dashboard);
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    router.replace(routes.login);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
