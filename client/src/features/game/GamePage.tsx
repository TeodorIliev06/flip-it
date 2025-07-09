import React, { useState, useCallback } from "react";

import GameBoard from "./GameBoard";
import { useTimer } from "../../shared/hooks/useTimer";

const GamePage: React.FC = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [moves, setMoves] = useState(0);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const seconds = useTimer(timerActive, resetSignal);

  const handleGameOver = () => setTimerActive(false);
  const handleMove = useCallback(() => setMoves((m) => m + 1), []);
  
  const handleDifficultySelect = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);

    setResetSignal((s) => s + 1);
    setTimerActive(false);
    setMoves(0);
  };

  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setTimerActive(false);
    setMoves(0);
  };

  const difficulties = ["Easy", "Intermediate", "Hard"];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
      <h1 className="text-4xl font-bold mb-8 text-white drop-shadow">
        FlipIt Memory Game
      </h1>
      
      {!difficulty ? (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Select Difficulty:
          </h2>
          <div className="flex gap-4">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultySelect(diff)}
                className="px-8 py-4 rounded-full bg-blue-600 text-white text-xl font-semibold hover:scale-105 transition-all duration-200"
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap gap-4 justify-center items-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
              <span className="mr-2">⏱️</span> Time: {seconds}s
            </span>
            
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
              <span className="mr-2">🎯</span> Moves: {moves}
            </span>
            
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
              <span className="mr-2">🎮</span> {difficulty}
            </span>
          </div>
          
          <GameBoard
            setTimerActive={setTimerActive}
            timerActive={timerActive}
            onGameOver={handleGameOver}
            onReset={handleReset}
            onMove={handleMove}
            moves={moves}
            seconds={seconds}
            difficulty={difficulty}
          />
        </>
      )}
    </div>
  );
};

export default GamePage;
