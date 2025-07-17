import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import { fetchLeaderboard } from "./leaderboardApi";
import type { ScoreResponse } from "./leaderboardTypes";

import { GAME_MODES, GAME_MODE_KEYS } from "../game/constants";

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const modeButtonBaseClass =
  "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-colors duration-200 cursor-pointer min-w-[140px] min-h-[100px] text-2xl font-bold";

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<ScoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string>(GAME_MODES[0].key);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(selectedMode)
      .then((data) => {
        setScores(data.topScores);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedMode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-2xl shadow-lg p-8 mt-10"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-white mb-8 drop-shadow"
        >
          Leaderboard
        </motion.h1>
        <div className="flex justify-center mb-8 gap-4">
          {GAME_MODES.map((mode) => {
            const selected = selectedMode === mode.key;
            return (
              <motion.button
                key={mode.key}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedMode(mode.key)}
                className={
                  modeButtonBaseClass +
                  (selected
                    ? " border-blue-600 bg-blue-600 text-white"
                    : " border-gray-700 bg-gray-900 text-white hover:bg-blue-500")
                }
              >
                {mode.name}
              </motion.button>
            );
          })}
        </div>
        {loading ? (
          <div className="text-white text-center py-8">Loading...</div>
        ) : (
          <motion.table
            className="min-w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg"
            initial="hidden"
            animate="visible"
          >
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-3 text-lg font-bold text-white">#</th>
                <th className="px-4 py-3 text-lg font-bold text-white">Name</th>
                <th className="px-4 py-3 text-lg font-bold text-white">
                  Moves
                </th>
                <th className="px-4 py-3 text-lg font-bold text-white">Time</th>
                {selectedMode === GAME_MODE_KEYS.CLASSIC && (
                  <th className="px-4 py-3 text-lg font-bold text-white">
                    Difficulty
                  </th>
                )}
              </tr>
            </thead>
            <motion.tbody
              variants={{
                visible: {
                  transition: { staggerChildren: 0.07 },
                },
              }}
            >
              {scores.map((score, idx) => (
                <motion.tr
                  key={score.id}
                  variants={rowVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`transition-all duration-200 ${
                    idx === 0
                      ? "bg-gradient-to-r from-yellow-400/30 to-yellow-200/10"
                      : idx === 1
                      ? "bg-gradient-to-r from-gray-400/30 to-gray-200/10"
                      : idx === 2
                      ? "bg-gradient-to-r from-orange-400/30 to-orange-200/10"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 text-white font-semibold text-center">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-white text-center">
                    {score.playerName}
                  </td>
                  <td className="px-4 py-3 text-white text-center">
                    {score.moves}
                  </td>
                  <td className="px-4 py-3 text-white text-center">
                    {score.timeInSeconds}s
                  </td>
                  {selectedMode === GAME_MODE_KEYS.CLASSIC && (
                    <td className="px-4 py-3 text-white text-center">
                      {score.difficulty}
                    </td>
                  )}
                </motion.tr>
              ))}
            </motion.tbody>
          </motion.table>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
