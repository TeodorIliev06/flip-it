import React, { useState, useCallback } from "react";

import GameBoard from "./GameBoard";
import { useTimer } from "../../shared/hooks/useTimer";

const GamePage: React.FC = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [moves, setMoves] = useState(0);

  const seconds = useTimer(timerActive, resetSignal);

  const handleGameOver = () => setTimerActive(false);
  const handleMove = useCallback(() => setMoves((m) => m + 1), []);

  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setTimerActive(false);
    setMoves(0);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-white drop-shadow">
        FlipIt Memory Game
      </h1>

      <div className="mb-8">
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
          <span className="mr-2">⏱️</span> Time: {seconds}s
        </span>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
          <span className="mr-2">🎯</span> Moves: {moves}
        </span>
      </div>
      <GameBoard
        setTimerActive={setTimerActive}
        timerActive={timerActive}
        onGameOver={handleGameOver}
        onReset={handleReset}
        onMove={handleMove}
      />
    </div>
  );
};

export default GamePage;
