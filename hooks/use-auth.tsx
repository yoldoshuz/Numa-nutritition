"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getProfile,
  logout as logoutRequest,
  verifyOtp as verifyOtpRequest,
  type UserProfile,
} from "@/lib/api/account";
import { onSessionChange, readSession } from "@/lib/api/axios";

/**
 * `loading` only covers the first read of the stored session. Every screen that
 * gates on sign-in has to tell "not signed in" apart from "not known yet",
 * otherwise a reload flashes the login prompt at someone who is signed in.
 */
type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: UserProfile | null;
  status: AuthStatus;
  /** Completes a sign-in with the code and returns the profile. */
  verifyOtp: (phone: string, otp: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  /** Replaces the cached profile after the customer edits it. */
  setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // One pass on mount: a stored token is only a claim, so it is spent on
  // `/auth/me` before anyone is treated as signed in. A token the backend has
  // forgotten resolves to "anonymous" here rather than at the first click.
  useEffect(() => {
    let cancelled = false;

    // Both sides start at `loading` so the server and the first client render
    // agree; localStorage is only consulted here, after hydration. The no-token
    // case still resolves through a promise rather than setting state straight
    // from the effect body.
    const resolved = readSession() ? getProfile() : Promise.resolve(null);

    resolved
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setStatus(profile ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The interceptor clears the session when a refresh fails, which can happen
  // mid-request on any screen; this is how the UI hears about it.
  useEffect(
    () =>
      onSessionChange((tokens) => {
        if (tokens) return;
        setUser(null);
        setStatus("anonymous");
      }),
    [],
  );

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const profile = await verifyOtpRequest(phone, otp);
    setUser(profile);
    setStatus("authenticated");
    return profile;
  }, []);

  const signOut = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, verifyOtp, signOut, setUser }),
    [user, status, verifyOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
