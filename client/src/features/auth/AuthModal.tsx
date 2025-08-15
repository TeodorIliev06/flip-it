import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "./AuthProvider";

import "./AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onAuthSuccess?: () => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string;
const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_OAUTH_SCOPES = "read:user user:email";

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

      if (!GOOGLE_CLIENT_ID) {
        console.warn("VITE_GOOGLE_CLIENT_ID is not set");
        return;
      }

      try {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
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
  }, [isOpen, googleLogin, onClose, onAuthSuccess]);


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

        {/* OAuth Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: 16,
          }}
        >
          {/* Google OAuth Button */}
          {!GOOGLE_CLIENT_ID && (
            <div className="auth-modal-error" style={{ marginBottom: 8 }}>
              Missing VITE_GOOGLE_CLIENT_ID env var
            </div>
          )}
          <div id="google-btn" ref={googleBtnRef as any} />

          {/* GitHub OAuth Button */}
          {!GITHUB_CLIENT_ID && (
            <div className="auth-modal-error">
              Missing VITE_GITHUB_CLIENT_ID env var
            </div>
          )}
          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="auth-modal-github-btn"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#24292e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {loading ? "Signing in..." : "Sign in with GitHub"}
          </button>
        </div>

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
