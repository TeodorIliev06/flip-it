import { useState, useEffect, useRef } from "react";

import type { Card as CardType } from "./gameTypes";

interface BaseGameLogicOptions {
  onInit?: (
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>,
    setIsMemorizing?: (b: boolean) => void
  ) => void;
  onReset?: (
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>,
    setIsMemorizing?: (b: boolean) => void
  ) => void;
  disableFlip?: boolean;
  isMemorizing?: boolean;
}

export function useGameLogic(
  deckGenerator: () => CardType[],
  onMove: () => void,
  failSound?: React.RefObject<HTMLAudioElement> | null,
  options: BaseGameLogicOptions = {}
) {
  const [cards, setCards] = useState<CardType[]>(deckGenerator());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [lock, setLock] = useState(false);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const initialized = useRef(false);

  // Run mode-specific init logic (e.g., memorization phase)
  useEffect(() => {
    if (!initialized.current && options.onInit) {
      options.onInit(setCards, setIsMemorizing);
      initialized.current = true;
    }
  }, []);

  const flipCard = (idx: number) => {
    if (
      lock ||
      gameOver ||
      cards[idx].isFlipped ||
      cards[idx].isMatched ||
      options.disableFlip ||
      (typeof options.isMemorizing === "boolean" && options.isMemorizing)
    ) {
      return;
    }
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    setCards((prev) =>
      prev.map((card, i) => (i === idx ? { ...card, isFlipped: true } : card))
    );
    if (newFlipped.length === 2) {
      setLock(true);
      setTimeout(() => {
        const [i1, i2] = newFlipped;
        if (cards[i1].value === cards[i2].value) {
          setCards((prev) =>
            prev.map((card, i) =>
              i === i1 || i === i2 ? { ...card, isMatched: true } : card
            )
          );
        } else {
          if (failSound && failSound.current) {
            failSound.current.currentTime = 0;
            failSound.current.play();
          }
          setCards((prev) =>
            prev.map((card, i) =>
              i === i1 || i === i2 ? { ...card, isFlipped: false } : card
            )
          );
        }
        setFlipped([]);
        setLock(false);
        onMove();
      }, 1000);
    }
  };

  const reset = () => {
    setCards(deckGenerator());
    setFlipped([]);
    setGameOver(false);
    setLock(false);
    setIsMemorizing(false);
    if (options.onReset) {
      options.onReset(setCards, setIsMemorizing);
    }
  };

  // Check for game over
  useEffect(() => {
    if (
      !gameOver &&
      cards.length > 0 &&
      cards.every((card) => card.isMatched)
    ) {
      setGameOver(true);
    }
  }, [cards]);

  return {
    cards,
    flipCard,
    gameOver,
    lock,
    reset,
    isMemorizing,
    setIsMemorizing, // expose for mode hooks
    setCards, // expose for mode hooks
    setGameOver, // expose for mode hooks
  };
}
