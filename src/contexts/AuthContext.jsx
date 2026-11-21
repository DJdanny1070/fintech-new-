import { createContext, useEffect, useState, useCallback } from "react";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  signOut as authSignOut,
  getSession,
  onAuthStateChange,
} from "../services/authService";
import { createProfile, getProfile } from "../services/profileService";
import { createWallet, getWallet } from "../services/walletService";
import { hashProfileCreation } from "../services/hashService";
import {
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  DEMO_USER,
  DEMO_PROFILE,
  getDemoWallet,
} from "../data/demoData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase auth user
  const [profile, setProfile] = useState(null); // profiles table row
  const [wallet, setWallet] = useState(null);   // wallets table row
  const [loading, setLoading] = useState(true); // initial session check

  // Load profile + wallet for a given user id
  const loadUserData = useCallback(async (userId) => {
    if (isDemoMode()) {
      setProfile(DEMO_PROFILE);
      setWallet(getDemoWallet());
      return;
    }

    try {
      const [prof, wal] = await Promise.all([
        getProfile(userId),
        getWallet(userId),
      ]);
      // Append cache-busting timestamp to avatar URL so header updates immediately
      if (prof && prof.avatar_url) {
        prof.avatar_url = prof.avatar_url + (prof.avatar_url.includes("?") ? "&" : "?") + `t=${Date.now()}`;
      }
      setProfile(prof);
      setWallet(wal);
    } catch (err) {
      console.error("Failed to load user data:", err.message);
    }
  }, []);

  // Listen for auth state changes (login, logout, token refresh)
  useEffect(() => {
    if (isDemoMode()) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setWallet(getDemoWallet());
      setLoading(false);
      return;
    }

    let unsubscribe;

    const init = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user.id);
        }
      } catch (err) {
        console.error("Session restore failed:", err.message);
      } finally {
        setLoading(false);
      }

      // Subscribe to future auth events
      unsubscribe = onAuthStateChange(async (session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setWallet(null);
        }
      });
    };

    init();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadUserData]);

  // ── Auth actions ─────────────────────────────────────────────

  const login = async (email, password) => {
    const cleaned = (email || "").trim().toLowerCase();
    if (
      (cleaned === "demo" || cleaned === "demo@cresox.internal") &&
      password === "CresoXDemo@2026"
    ) {
      enableDemoMode();
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setWallet(getDemoWallet());
      setLoading(false);
      return { user: DEMO_USER, session: { user: DEMO_USER } };
    }

    const data = await signInWithEmail(email, password);
    // onAuthStateChange will fire and call loadUserData
    return data;
  };

  const loginWithGoogle = async () => {
    return signInWithGoogle(); // triggers OAuth redirect
  };

  /**
   * register — INTERNAL USE ONLY.
   *
   * Public self-registration has been disabled. This function is kept in
   * place for the upcoming invitation flow, which will call it server-side
   * or via an admin-controlled process. It is intentionally NOT exported
   * through the context value to prevent accidental UI usage.
   *
   * When the invitation flow is integrated, this should be called after
   * the invitation token is validated, with the user's pre-approved role
   * and approval_status set to 'Approved' at creation time.
   */
  // eslint-disable-next-line no-unused-vars
  const register = async (email, password, fullName, role) => {
    const data = await signUpWithEmail(email, password, {
      full_name: fullName,
      role,
    });

    const userId = data.user?.id;
    if (!userId) {
      return data;
    }

    try {
      const prof = await createProfile(userId, {
        full_name: fullName,
        email,
        role,
      });

      const wal = await createWallet(userId);

      // Blockchain: hash the profile creation event
      await hashProfileCreation(userId, { full_name: fullName, email, role });

      setProfile(prof);
      setWallet(wal);
    } catch (err) {
      console.error("Registration follow-up failed:", err.message);
    }

    return data;
  };

  const logout = async () => {
    if (isDemoMode()) {
      disableDemoMode();
      setUser(null);
      setProfile(null);
      setWallet(null);
      return;
    }

    await authSignOut();
    setUser(null);
    setProfile(null);
    setWallet(null);
  };

  // Reload wallet (call after balance changes)
  const refreshWallet = async () => {
    if (isDemoMode()) {
      setWallet(getDemoWallet());
      return;
    }

    if (user) {
      const wal = await getWallet(user.id);
      setWallet(wal);
    }
  };

  // Reload profile explicitly (call after profile updates)
  const refreshProfile = async () => {
    if (isDemoMode()) {
      setProfile(DEMO_PROFILE);
      return;
    }

    try {
      if (user) {
        const prof = await getProfile(user.id);
        if (prof && prof.avatar_url) {
          prof.avatar_url = prof.avatar_url + (prof.avatar_url.includes("?") ? "&" : "?") + `t=${Date.now()}`;
        }
        setProfile(prof);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err.message);
    }
  };

  const value = {
    user,
    profile,
    wallet,
    loading,
    login,
    loginWithGoogle,
    // register is intentionally NOT in context — see note above.
    logout,
    refreshWallet,
    refreshProfile,
    isAuthenticated: !!user,
    // Convenience: 'Pending' | 'Approved' | 'Rejected' | null
    approvalStatus: isDemoMode() ? "Approved" : (profile?.approval_status ?? null),
    isDemo: isDemoMode(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
