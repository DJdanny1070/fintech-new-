import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/common/ToastProvider";
import AccessPending from "../pages/AccessPending";
import { isDemoMode } from "../data/demoData";

/**
 * ProtectedRoute
 *
 * Guards that must ALL pass before the child route renders:
 *
 *  1. Authentication — user must be signed in, else redirect to /login.
 *  2. Approval — profile.approval_status must be 'Approved'.
 *     • Pending  → render <AccessPending> (in-place, no redirect)
 *     • Rejected → render <AccessPending> (in-place, no redirect)
 *
 * The approval gate is deliberate: we render AccessPending inline rather
 * than redirecting so the URL stays at the intended route, making it easier
 * to test and iterate on the approval flow without breaking navigation state.
 *
 * When the invitation flow is wired up, approved users will automatically
 * pass gate 2 from the moment their account is created with approval_status
 * set to 'Approved'.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, profile } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && wasAuthenticated.current) {
      toast.warning("Session expired");
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, loading, toast]);

  // ── 1. Restoring session — avoid flash ──────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: 14,
          color: "var(--text-muted)",
          fontFamily: "var(--font)",
        }}
      >
        <span className="spinner" style={{ marginRight: 8 }} />
        Loading...
      </div>
    );
  }

  // ── 2. Not authenticated → login ────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Demo Mode: Instant Access (Bypass Approval Gates) ────────────
  if (isDemoMode()) {
    return children;
  }

  // ── 3. Authenticated but approval not yet resolved ───────────────
  // While profile is still loading (null), let the child render rather
  // than flashing the pending screen. The profile loads immediately after
  // session restore in AuthContext, so this window is very brief.
  if (profile !== null) {
    const approvalStatus = profile?.approval_status;

    // If approval_status is missing entirely (e.g. old row before migration),
    // treat as approved to avoid locking out existing users.
    if (approvalStatus && approvalStatus !== "Approved") {
      return <AccessPending />;
    }
  }

  // ── 4. All gates passed ─────────────────────────────────────────
  return children;
}

export default ProtectedRoute;
