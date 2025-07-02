import React, { useEffect, useRef } from "react";

import Card from "./Card";
import { useGameLogic } from "./useGameLogic";

import type { Card as CardType } from "./gameTypes";

import "./game.css";

type GameBoardProps = {
  setTimerActive: React.Dispatch<React.SetStateAction<boolean>>;
  timerActive: boolean;
  onGameOver: () => void;
  onReset: () => void;
  onMove: () => void;
};

const symbols = ["🍎", "🍌", "🍇", "🍉"];
const initialDeck: CardType[] = symbols
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
}) => {
  const winSound = useRef(new Audio("/sounds/win.wav"));
  const failSound = useRef(new Audio("/sounds/fail.mp3"));

  const { cards, flipCard, gameOver, reset } = useGameLogic(
    initialDeck,
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
        <button
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => {
            reset();
            onReset();
          }}
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default GameBoard;
