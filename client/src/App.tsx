import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import GamePage from "./features/game/GamePage";
import AuthModal from "./features/auth/AuthModal";
import Leaderboard from "./features/leaderboard/Leaderboard";

import { useAuth } from "./features/auth/AuthProvider";

function App() {
  const { user, logout, githubLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      const cleanUrl = window.location.origin;
      window.history.replaceState({}, document.title, cleanUrl);

      githubLogin(code)
        .then(() => {
          console.log("GitHub login successful, auth state updated");
          let returnUrl = "/";
          if (state) {
            try {
              const stateData = JSON.parse(decodeURIComponent(state));
              const url = new URL(stateData.returnUrl);

              returnUrl = url.pathname || "/";
            } catch (e) {
              console.error("Failed to parse state:", e);
            }
          }
          navigate(returnUrl);
        })
        .catch((error) => {
          console.error("GitHub login failed:", error);
          navigate("/");
        });
    }
  }, [location.search, navigate]);

  return (
    <>
      <div className="min-h-screen w-screen bg-gray-900">
        <nav className="fixed top-0 left-0 w-full bg-gray-950 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center py-4 px-4 text-white">
            <div className="flex gap-6">
              <Link
                to="/"
                className="text-lg font-bold px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:text-blue-300"
              >
                Game
              </Link>
              <Link
                to="/leaderboard"
                className="text-lg font-bold px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:text-blue-300"
              >
                Leaderboard
              </Link>
            </div>
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-300 font-medium">
                        Welcome, {user.username}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                      title="Sign out"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-300 font-medium">
                      Guest
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                    title="Sign in to save scores"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10,17 15,12 10,7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<GamePage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export default App;
