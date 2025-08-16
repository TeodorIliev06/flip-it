import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import GamePage from "./features/game/GamePage";
import Leaderboard from "./features/leaderboard/Leaderboard";

import { useAuth } from "./features/auth/AuthProvider";

function App() {
  const { user, logout, githubLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
                  <span className="text-sm text-gray-300">{user.email}</span>
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-400">Guest</span>
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
    </>
  );
}

export default App;
