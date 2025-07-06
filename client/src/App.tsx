import { Routes, Route, Link } from "react-router-dom";

import GamePage from "./features/game/GamePage";
import Leaderboard from "./features/leaderboard/Leaderboard";

function App() {
  return (
    <>
      <div className="min-h-screen w-screen bg-gray-900">
        <nav className="fixed top-0 left-0 w-full bg-gray-950 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex justify-center gap-8 py-4 px-4">
            <Link
              to="/"
              className="text-lg font-bold px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white hover:text-blue-300"
            >
              Game
            </Link>
            <Link
              to="/leaderboard"
              className="text-lg font-bold px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white hover:text-blue-300"
            >
              Leaderboard
            </Link>
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
