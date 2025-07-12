import { useState, useEffect } from "react";
import type { Card as CardType } from "./gameTypes";
import type { IGameModeLogic } from "./modes/IGameModeLogic";

export function useGameLogic(
  initialDeck: () => CardType[],
  failSoundRef?: React.RefObject<HTMLAudioElement>,
  onMove?: () => void,
  modeLogic?: IGameModeLogic
) {
  const [cards, setCards] = useState<CardType[]>(initialDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [mistakeMade, setMistakeMade] = useState(false);

  // Reset all state when deck or mode changes
  useEffect(() => {
    setCards(initialDeck());
    setFlipped([]);
    setLock(false);
    setGameOver(false);
    setMistakeMade(false);
    if (modeLogic && modeLogic.onGameStart) {
      setIsMemorizing(true);
      modeLogic.onGameStart(setCards, setIsMemorizing);
    } else {
      setIsMemorizing(false);
    }
  }, [initialDeck, modeLogic]);

  const flipCard = (idx: number) => {
    if (lock || flipped.length === 2) {
      return;
    }
    if (cards[idx].isFlipped || cards[idx].isMatched) {
      return;
    }
    if (modeLogic?.onGameStart && isMemorizing) {
      return;
    }
    if (gameOver) {
      return;
    }
    setCards((prev) =>
      prev.map((card, i) => (i === idx ? { ...card, isFlipped: true } : card))
    );
    setFlipped((prev) => [...prev, idx]);
  };

  useEffect(() => {
    if (modeLogic && flipped.length === 2) {
      modeLogic.onCardFlip({
        cards,
        flipped,
        setGameOver,
        setMistakeMade,
        setLock,
        failSoundRef,
      });
      setTimeout(() => {
        setCards((prev) => {
          const [i, j] = flipped;
          if (prev[i] && prev[j] && prev[i].value === prev[j].value) {
            return prev.map((card, idx) =>
              idx === i || idx === j ? { ...card, isMatched: true } : card
            );
          } else {
            return prev.map((card, idx) =>
              idx === i || idx === j ? { ...card, isFlipped: false } : card
            );
          }
        });
        setFlipped([]);
        if (onMove) {
          onMove();
        }
      }, 1000);
    }
  }, [flipped]);

  useEffect(() => {
    if (modeLogic && modeLogic.isGameOver && modeLogic.isGameOver(cards)) {
      setGameOver(true);
    }
  }, [cards]);

  return {
    cards,
    flipCard,
    gameOver,
    isMemorizing,
    mistakeMade,
    lock,
    reset: () => {
      setCards(initialDeck());
      setFlipped([]);
      setLock(false);
      setGameOver(false);
      setMistakeMade(false);
      setIsMemorizing(false);
    },
  };
}
