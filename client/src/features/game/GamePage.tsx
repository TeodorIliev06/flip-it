import React, { useState, useCallback } from "react";

import GameBoard from "./GameBoard";
import ModeSelector from "./selectors/ModeSelector";
import DifficultySelector from "./selectors/DifficultySelector";

import { useTimer } from "../../shared/hooks/useTimer";

const GAME_MODES = [
  {
    key: "classic",
    name: "Classic",
    description: "Match all pairs in as few moves as possible.",
    icon: "🃏",
    supportsDifficulty: true,
  },
  {
    key: "memoryMaster",
    name: "Memory Master",
    description: "Memorize the board, then match all pairs without a single mistake!",
    icon: "🧠",
    supportsDifficulty: false,
  },
  {
    key: "timed",
    name: "Timed",
    description: "Match all pairs in the allocated time.",
    icon: "⏰",
    supportsDifficulty: false,
  }
];

const difficulties = ["Easy", "Intermediate", "Hard"];

const GamePage: React.FC = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [moves, setMoves] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const seconds = useTimer(timerActive, resetSignal);

  const handleGameOver = () => setTimerActive(false);
  const handleMove = useCallback(() => setMoves((m) => m + 1), []);

  const handleModeSelect = (modeKey: string) => {
    setSelectedMode(modeKey);
    setSelectedDifficulty(null);
  };

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setTimerActive(false);
    setMoves(0);
    setSelectedMode(null);
    setSelectedDifficulty(null);
  };

  const currentMode = GAME_MODES.find((mode) => mode.key === selectedMode);

  if (!selectedMode) {
    return (
      <ModeSelector
        modes={GAME_MODES}
        selectedMode={selectedMode}
        onSelect={handleModeSelect}
      />
    );
  }

  if (currentMode?.supportsDifficulty && !selectedDifficulty) {
    return (
      <DifficultySelector
        difficulties={difficulties}
        selectedDifficulty={selectedDifficulty}
        onSelect={handleDifficultySelect}
      />
    );
  }

  let pillLabel = "";
  if (currentMode?.key === "classic" && selectedDifficulty) {
    pillLabel = selectedDifficulty;
  } else if (currentMode) {
    pillLabel = currentMode.name;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full overflow-hidden">
      <h1 className="text-4xl font-bold mb-4 text-white drop-shadow">FlipIt Memory Game</h1>
      <div className="mb-8 flex gap-4">
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
          <span className="mr-2">⏱️</span> Time: {selectedMode === "timed" && timeLeft !== null ? timeLeft : seconds}s
        </span>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
          <span className="mr-2">🎯</span> Moves: {moves}
        </span>
        {pillLabel && (
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 text-white text-lg font-semibold shadow">
            <span className="mr-2">🎮</span> {pillLabel}
          </span>
        )}
      </div>
      <GameBoard
        setTimerActive={setTimerActive}
        timerActive={timerActive}
        onGameOver={handleGameOver}
        onReset={handleReset}
        onMove={handleMove}
        moves={moves}
        seconds={seconds}
        difficulty={selectedDifficulty || "Easy"}
        mode={selectedMode}
        onTimeLeftChange={setTimeLeft}
      />
    </div>
  );
};

export default GamePage;
