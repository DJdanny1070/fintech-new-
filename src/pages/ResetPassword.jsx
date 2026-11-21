import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "../services/authService";
import { useToast } from "../components/common/ToastProvider";
import "./Auth.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const isValidEmail = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setMessage("If an account exists for that email, a reset link has been sent. Please check your inbox and spam folder.");
      toast.success("Password reset email sent.");
      setEmail("");
    } catch (err) {
      const messageText = err?.message || "We could not send the password reset email.";
      setError(messageText);
      toast.error(messageText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__panel">
        <Link to="/" className="auth-panel__logo">
          <div className="auth-panel__logo-brand">
            <span className="auth-panel__logo-creso">creso</span>
            <span className="auth-panel__logo-x">x</span>
          </div>
          <span className="auth-panel__logo-sub">FINTECH PRIVATE LIMITED</span>
        </Link>
        <p className="auth-panel__tagline">Reset access securely.</p>
        <p className="auth-panel__sub">
          Enter the email linked to your approved account. We will send a password reset link if the account exists.
        </p>
      </div>

      <div className="auth-page__form-area">
        <div className="auth-card auth-card--wide">
          <Link to="/login" className="auth-card__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to sign in
          </Link>

          <div className="auth-card__header">
            <h1 className="auth-card__title">Forgot Password</h1>
            <p className="auth-card__sub">Enter your email and we’ll send a secure reset link.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {message && <div className="auth-success" role="status">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="input-label" htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                className="input"
                type="email"
            
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
              <span className="auth-field__hint">Use the email address associated with your approved account.</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading || !isValidEmail}
              aria-busy={loading}
            >
              {loading ? <><span className="spinner" /> Sending reset link...</> : "Send reset link →"}
            </button>
          </form>

          <div className="auth-card__footer">
            <Link to="/login" className="auth-link">Return to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
