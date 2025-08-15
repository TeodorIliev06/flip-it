import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import "./AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "login",
  onAuthSuccess,
}) => {
  const { login, register, googleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const initializeAndRender = () => {
      // @ts-ignore
      const google = window.google?.accounts?.id;
      if (!google) {
        console.log("Google accounts.id not available");
        return;
      }

      if (!clientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID is not set");
        return;
      }

      try {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp: any) => {
            try {
              await googleLogin(resp.credential);
              onClose();
              onAuthSuccess?.();
            } catch {
              setError("Google sign-in failed");
            }
          },
        });

        if (googleBtnRef.current) {
          // @ts-ignore
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_blue",
            size: "large",
            shape: "rectangular",
            width: 320,
          });
        } else {
          console.log("Button container not found");
        }
      } catch (e) {
        console.error("Failed to initialize Google Identity Services", e);
      }
    };

    // @ts-ignore
    if (window.google?.accounts?.id) {
      initializeAndRender();
      return;
    }

    // Inject script once
    const existing = document.getElementById("google-gsi");
    if (existing) {
      existing.addEventListener("load", initializeAndRender, { once: true });
      return () =>
        existing.removeEventListener("load", initializeAndRender as any);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-gsi";
    script.onload = initializeAndRender;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [isOpen, clientId, googleLogin, onClose, onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setEmail("");
      setPassword("");
      onClose();
      onAuthSuccess?.();
    } catch (err) {
      setError(activeTab === "login" ? "Login failed" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {activeTab === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button onClick={onClose} className="auth-modal-close">
            ×
          </button>
        </div>

        <div className="auth-modal-tabs">
          <button
            onClick={() => setActiveTab("login")}
            className={`auth-modal-tab ${
              activeTab === "login" ? "active" : ""
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`auth-modal-tab ${
              activeTab === "register" ? "active" : ""
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth Button */}
        {!clientId && (
          <div className="auth-modal-error" style={{ marginBottom: 8 }}>
            Missing VITE_GOOGLE_CLIENT_ID env var
          </div>
        )}
        <div
          id="google-btn"
          ref={googleBtnRef as any}
          style={{ marginBottom: 16 }}
        />

        <div className="auth-modal-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-modal-input"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-modal-input"
              required
            />
          </div>

          {error && <div className="auth-modal-error">{error}</div>}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="auth-modal-submit"
          >
            {loading
              ? activeTab === "login"
                ? "Signing in..."
                : "Creating account..."
              : activeTab === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="auth-modal-footer">
          {activeTab === "login" ? (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setActiveTab("register")} type="button">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setActiveTab("login")} type="button">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
