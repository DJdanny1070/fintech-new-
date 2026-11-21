import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/common/ToastProvider";
import "./Auth.css";

const FEATURES = [
  "Asset tokenization for real-world assets",
  "Blockchain-recorded ownership — permanent and verifiable",
  "Secure digital asset marketplace (verified users only)",
  "Direct access to expert consultancy",
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [form, setForm]                   = useState({ email: "", password: "" });
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]                 = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Signed in successfully.");
      navigate(from, { replace: true });
    } catch (err) {
      const rawMessage = err?.message || "";
      let message = "We could not sign you in. Please check your credentials and try again.";
      if (/failed to fetch|network|load failed/i.test(rawMessage)) {
        message = `Cannot connect to Supabase backend (${rawMessage}). The project host is unreachable. Please verify your Supabase project is active and that VITE_SUPABASE_URL in .env matches your project.`;
      } else if (rawMessage) {
        message = rawMessage;
      }
      setError(message);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      const rawMessage = err?.message || "";
      let message = "Google login failed.";
      if (/failed to fetch|network|load failed/i.test(rawMessage)) {
        message = `Cannot connect to Supabase backend (${rawMessage}). Please verify your Supabase project is active and that VITE_SUPABASE_URL in .env is correct.`;
      } else if (rawMessage) {
        message = rawMessage;
      }
      setError(message);
      toast.error("Login failed");
      setGoogleLoading(false);
    }
  };

  const isDisabled = loading || googleLoading;

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-page__panel">
        <Link to="/" className="auth-panel__logo">
          <div className="auth-panel__logo-brand">
            <span className="auth-panel__logo-creso">creso</span>
            <span className="auth-panel__logo-x">x</span>
          </div>
          <span className="auth-panel__logo-sub">FINTECH PRIVATE LIMITED</span>
        </Link>

        <p className="auth-panel__tagline">Access is by invitation only.</p>
        <p className="auth-panel__sub">
          CresoX is a verified platform. Only approved users can sign in.
          If you have submitted a service request and been approved, use
          your credentials below.
        </p>

        <div className="auth-panel__features">
          {FEATURES.map((f) => (
            <div className="auth-panel__feature" key={f}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        <div className="auth-panel__notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          New to CresoX?{" "}
          <Link to="/services" className="auth-link">Explore our services →</Link>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-page__form-area">
        <div className="auth-card">
          <Link to="/" className="auth-card__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to home
          </Link>

          <div className="auth-card__header">
            <h1 className="auth-card__title">Sign in to CresoX</h1>
            <p className="auth-card__sub">Welcome back. Enter your approved credentials to continue.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">{error}</div>
          )}

          <button
            className="auth-social-btn"
            onClick={handleGoogleLogin}
            disabled={isDisabled}
            aria-busy={googleLoading}
          >
            {googleLoading ? (
              <><span className="spinner" /> Connecting...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.6 0 6.5 1.4 8.4 3.3l6.3-6.3C35.2 2.9 30 .5 24 .5 14.8.5 6.9 6 2.8 14l7.4 5.7C12.2 13.5 17.6 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.5 37.3 46.5 31.3 46.5 24.5z" />
                  <path fill="#FBBC05" d="M10.3 28.8A14.5 14.5 0 019.5 24c0-1.7.3-3.3.8-4.8L2.9 13.5A23.5 23.5 0 00.5 24c0 3.8.9 7.3 2.4 10.5l7.4-5.7z" />
                  <path fill="#34A853" d="M24 47.5c6 0 11-2 14.7-5.3l-7.4-5.7c-2 1.3-4.5 2-7.3 2-6.4 0-11.8-4-13.7-9.7l-7.4 5.7C6.9 42 14.8 47.5 24 47.5z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="divider-text">or sign in with email</div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="input-label" htmlFor="login-email">Email address or Username</label>
              <input
                id="login-email"
                className="input"
                type="text"
                placeholder="name@company.com or demo"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="username"
                disabled={isDisabled}
              />
              <span className="auth-field__hint">
                Use your approved account credentials or demo credentials to sign in.
              </span>
            </div>

            <div className="auth-field">
              <div className="auth-field__row">
                <label className="input-label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="auth-forgot" aria-label="Reset your password">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                className="input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                disabled={isDisabled}
              />
              <span className="auth-field__hint">
                Your password was set when your account was approved.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isDisabled || !form.email || !form.password}
              aria-busy={loading}
            >
              {loading ? <><span className="spinner" /> Signing in...</> : "Sign In →"}
            </button>

            {/* Demo Mode Quick Access Card for Internship Report & Screenshots */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "var(--blue-light)",
                border: "1px solid var(--border-focus)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--blue)" }}>
                  Demo Access (Internship Screenshots)
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "11px", padding: "2px 8px", height: "auto" }}
                  onClick={() => setForm({ email: "demo", password: "CresoXDemo@2026" })}
                >
                  Autofill
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                User: <strong>demo</strong> | Pass: <strong>CresoXDemo@2026</strong>
              </div>
            </div>
          </form>

          <div className="auth-card__footer">
            Don&apos;t have an account?{" "}
            <Link to="/services" className="auth-link">Request access via our services →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
