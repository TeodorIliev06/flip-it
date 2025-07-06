import React, { useEffect, useRef } from "react";

import Card from "./Card";
import SaveScoreForm from "./SaveScoreForm";
import { useGameLogic } from "./useGameLogic";

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
};

const symbols = ["🍎", "🍌", "🍇", "🍉"];
const generateDeck = (): CardType[] =>
  symbols
    .concat(symbols)
    .map((value, idx) => ({
      id: `${value}-${idx}`,
      value,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);

const GameBoard: React.FC<GameBoardProps> = ({
  setTimerActive,
  timerActive,
  onGameOver,
  onReset,
  onMove,
  moves,
  seconds,
}) => {
  const winSound = useRef(new Audio("/sounds/win.wav"));
  const failSound = useRef(new Audio("/sounds/fail.mp3"));

  const { cards, flipCard, gameOver, reset } = useGameLogic(
    generateDeck,
    failSound,
    onMove
  );

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      winSound.current.currentTime = 0;
      winSound.current.play();

      onGameOver();
    }
  }, [cards, onGameOver]);

  const handleCardClick = (idx: number) => {
    if (
      !timerActive &&
      cards.every((card) => !card.isFlipped && !card.isMatched)
    ) {
      setTimerActive(true);
    }

    flipCard(idx);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-8 w-full max-w-4xl px-4">
        {cards.map((card, idx) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => handleCardClick(idx)}
          />
        ))}
      </div>

      {gameOver && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <SaveScoreForm moves={moves} seconds={seconds} />

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
