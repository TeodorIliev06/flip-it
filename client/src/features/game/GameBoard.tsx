import React, { useEffect, useRef, useCallback } from "react";

import Card from "./Card";
import SaveScoreForm from "./saveForm/SaveScoreForm";
import { allSymbols } from "./symbols";
import { useGameModeLogic } from "./useGameModeLogic";

import type { Card as CardType } from "./gameTypes";

import "./game.css";

type GameBoardProps = {
  setTimerActive: React.Dispatch<React.SetStateAction<boolean>>;
  timerActive: boolean;
  onGameOver: () => void;
  onReset: () => void;
  onMove: () => void;
  moves: number;
  seconds: number;
  difficulty: string;
  mode: string;
  onTimeLeftChange?: (timeLeft: number) => void;
};

const difficultySettings = {
  Easy: { rows: 2, columns: 4 },
  Intermediate: { rows: 4, columns: 4 },
  Hard: { rows: 5, columns: 6 },
};

const generateDeck = (difficulty: string): CardType[] => {
  const { rows, columns } =
    difficultySettings[difficulty as keyof typeof difficultySettings] ||
    difficultySettings.Easy;
  const pairs = (rows * columns) / 2;
  const symbols = allSymbols.slice(0, pairs);
  return symbols
    .concat(symbols)
    .map((value, idx) => ({
      id: `${value}-${idx}`,
      value,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);
};

const GameBoard: React.FC<GameBoardProps> = ({
  setTimerActive,
  timerActive,
  onGameOver,
  onReset,
  onMove,
  moves,
  seconds,
  difficulty,
  mode,
  onTimeLeftChange,
}) => {
  const winSound = useRef(new Audio("/sounds/win.wav"));
  const loseSound = useRef(new Audio("/sounds/lose.wav"));
  const failSound = useRef(new Audio("/sounds/fail.mp3"));

  const deckGenerator = useCallback(
    () => generateDeck(difficulty),
    [difficulty]
  );

  // Use the new mode selector hook
  const { cards, flipCard, gameOver, isMemorizing, lock, reset, timeLeft } =
    useGameModeLogic(mode, deckGenerator, failSound, loseSound, onMove, onGameOver);

  // Notify parent of timeLeft changes in Timed mode
  useEffect(() => {
    if (mode === "timed" && typeof timeLeft === "number" && onTimeLeftChange) {
      onTimeLeftChange(timeLeft);
    }
  }, [timeLeft, mode, onTimeLeftChange]);

  const columns =
    difficultySettings[difficulty as keyof typeof difficultySettings]
      ?.columns || 4;

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      winSound.current.currentTime = 0;
      winSound.current.play();
      onGameOver();
    }
  }, [cards, onGameOver]);

  useEffect(() => {
    if (gameOver) {
      setTimerActive(false);
    }
  }, [gameOver, setTimerActive]);

  const handleCardClick = (idx: number) => {
    if (
      !timerActive &&
      cards.every((card) => !card.isFlipped && !card.isMatched)
    ) {
      setTimerActive(true);
    }
    flipCard(idx);
  };

  const showAllFlipped = mode === "memoryMaster" && isMemorizing;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`grid ${
          columns === 4
            ? "grid-cols-4"
            : columns === 6
            ? "grid-cols-6"
            : "grid-cols-5"
        } gap-8 w-full max-w-4xl px-4`}
      >
        {cards.map((card, idx) => (
          <Card
            key={card.id}
            card={showAllFlipped ? { ...card, isFlipped: true } : card}
            onClick={() => handleCardClick(idx)}
            disabled={lock || gameOver}
          />
        ))}
      </div>

      {gameOver && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <SaveScoreForm
              moves={moves}
              seconds={seconds}
              difficulty={difficulty}
            />

            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => {
                reset();
                onReset();
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
