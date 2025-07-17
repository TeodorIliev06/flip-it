import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

import { fetchLeaderboard } from "./leaderboardApi";
import type { ScoreResponse } from "./leaderboardTypes";

import { GAME_MODES, GAME_MODE_KEYS } from "../game/constants";

import "./index.css";

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const modeButtonBaseClass =
  "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-colors duration-200 cursor-pointer min-w-[140px] min-h-[100px] text-2xl font-bold";

const difficulties = ["Easy", "Intermediate", "Hard"];

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<ScoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string>(GAME_MODES[0].key);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    difficulties[0]
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const filterRef = useRef<HTMLSpanElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(
      selectedMode,
      selectedMode === GAME_MODE_KEYS.CLASSIC ? selectedDifficulty : undefined
    )
      .then((data) => {
        setScores(data.topScores);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedMode, selectedDifficulty]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // When opening dropdown, measure position
  const handleFilterClick = () => {
    if (filterRef.current) {
      const rect = filterRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 6, // 6px offset
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setShowDropdown((v) => !v);
  };

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
                  <th className="px-4 py-3 text-lg font-bold text-white relative overflow-visible">
                    <div className="flex justify-center items-center w-full">
                      Difficulty
                    </div>
                    <span
                      ref={filterRef}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <button
                        onClick={handleFilterClick}
                        className="filter-btn focus:outline-none rounded transition-none"
                        aria-label="Filter by difficulty"
                        tabIndex={0}
                        type="button"
                      >
                        {/* Modern filter SVG icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 5H17M6 9H14M9 13H11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </span>
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
      {/* Portal dropdown: always rendered, positioned absolutely */}
      {showDropdown &&
        dropdownPos &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: dropdownPos.width,
              zIndex: 1000,
            }}
            className="bg-gray-800 border border-gray-700 rounded shadow-xl p-1"
          >
            <ul className="py-1">
              {difficulties.map((level) => (
                <li key={level}>
                  <button
                    className={`w-full text-left px-4 py-2 text-white hover:bg-blue-600 transition ${
                      selectedDifficulty === level ? "bg-blue-600" : ""
                    }`}
                    onClick={() => {
                      setSelectedDifficulty(level);
                      setTimeout(() => setShowDropdown(false), 0);
                    }}
                  >
                    {level}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Leaderboard;
