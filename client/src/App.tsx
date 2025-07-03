import { Routes, Route, Link } from "react-router-dom";

import GamePage from "./features/game/GamePage";
import Leaderboard from "./features/leaderboard/Leaderboard";

function App() {
  return (
    <>
      <div className="min-h-screen w-screen bg-gray-900">
        <nav className="flex justify-center gap-8 py-6">
          <Link to="/" className="text-white text-lg font-bold hover:underline">Game</Link>
          <Link to="/leaderboard" className="text-white text-lg font-bold hover:underline">Leaderboard</Link>
        </nav>
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
