import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "./leaderboardApi";
import type { ScoreResponse } from "./leaderboardTypes";

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<ScoreResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then((data) => {
        setScores(data.topScores);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-[300px] bg-gray-800 rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Moves</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, idx) => (
              <tr key={score.id}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{score.playerName}</td>
                <td className="px-4 py-2">{score.moves}</td>
                <td className="px-4 py-2">{score.timeInSeconds}s</td>
                <td className="px-4 py-2">{score.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
