import React, { useEffect, useState } from "react";

import { useAuth } from "./AuthProvider";
import { loginWithGoogle } from "./authApi";

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
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogle = () => {
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
          callback: () => {
            // This callback is not used since we handle it in handleGoogleSignIn
          },
        });
      } catch (e) {
        console.error("Failed to initialize Google Identity Services", e);
      }
    };

    // @ts-ignore
    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    // Inject script once
    const existing = document.getElementById("google-gsi");
    if (existing) {
      existing.addEventListener("load", initializeGoogle, { once: true });
      return () =>
        existing.removeEventListener("load", initializeGoogle as any);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-gsi";
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!GOOGLE_CLIENT_ID) {
        setError("Google Client ID not configured");
        return;
      }

      // @ts-ignore
      const google = window.google?.accounts?.id;
      if (!google) {
        setError("Google Sign-In not available");
        return;
      }

      // Call our api with the IdToken
      google.prompt((response: any) => {
        if (response.credential) {
          loginWithGoogle(response.credential)
            .then(() => {
              onClose();
              onAuthSuccess?.();
            })
            .catch(() => {
              setError("Failed to continue with Google");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to continue with Google");
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!GITHUB_CLIENT_ID) {
        setError("GitHub Client ID not configured");
        return;
      }

      // Create state parameter for security and return URL tracking
      const state = JSON.stringify({
        returnUrl: window.location.origin,
        timestamp: Date.now(),
      });

      const githubAuthUrl = new URL(GITHUB_OAUTH_URL);
      githubAuthUrl.searchParams.append("client_id", GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.append("redirect_uri", window.location.origin);
      githubAuthUrl.searchParams.append("scope", GITHUB_OAUTH_SCOPES);
      githubAuthUrl.searchParams.append("state", state);

      sessionStorage.setItem("githubAuthReturnUrl", window.location.href);

      window.location.href = githubAuthUrl.toString();
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      setError("Failed to continue with GitHub");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      setUsername("");
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
            onClick={() => {
              setActiveTab("login");
              setUsername("");
            }}
            className={`auth-modal-tab ${
              activeTab === "login" ? "active" : ""
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setUsername("");
            }}
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
            display: activeTab === "login" ? "flex" : "none",
            flexDirection: "column",
            gap: "12px",
            marginBottom: activeTab === "login" ? 16 : 0,
          }}
        >
          {!GOOGLE_CLIENT_ID && activeTab === "login" && (
            <div className="auth-modal-error" style={{ marginBottom: 8 }}>
              Missing VITE_GOOGLE_CLIENT_ID env var
            </div>
          )}
          {activeTab === "login" && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="auth-modal-google-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          )}

          {!GITHUB_CLIENT_ID && activeTab === "login" && (
            <div className="auth-modal-error">
              Missing VITE_GITHUB_CLIENT_ID env var
            </div>
          )}
          {activeTab === "login" && (
            <button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="auth-modal-github-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          )}
        </div>

        {activeTab === "login" && (
          <div className="auth-modal-divider">
            <span>or</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {activeTab === "register" && (
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-modal-input"
                required
              />
            </div>
          )}

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
            disabled={
              loading ||
              !email.trim() ||
              !password.trim() ||
              (activeTab === "register" && !username.trim())
            }
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
