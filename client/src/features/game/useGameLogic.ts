import { useState, useEffect } from "react";

import type { Card as CardType } from "./gameTypes";

export function useGameLogic(
  initialDeck: CardType[],
  failSoundRef?: React.RefObject<HTMLAudioElement>,
  onMove?: () => void
) {
  const [cards, setCards] = useState<CardType[]>(initialDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const flipCard = (idx: number) => {
    if (
      lock ||
      flipped.length === 2 ||
      cards[idx].isFlipped ||
      cards[idx].isMatched
    ) {
      return;
    }
    setCards((prev) =>
      prev.map((card, i) => (i === idx ? { ...card, isFlipped: true } : card))
    );

    setFlipped((prev) => [...prev, idx]);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setLock(true);
      const [i, j] = flipped;
      setTimeout(() => {
        setCards((prev) => {
          if (prev[i].value === prev[j].value) {
            return prev.map((card, idx) =>
              idx === i || idx === j ? { ...card, isMatched: true } : card
            );
          } else {
            if (failSoundRef && failSoundRef.current) {
              failSoundRef.current.currentTime = 0;
              failSoundRef.current.play();
            }
            return prev.map((card, idx) =>
              idx === i || idx === j ? { ...card, isFlipped: false } : card
            );
          }
        });
        setFlipped([]);
        setLock(false);

        if (onMove) {
          onMove();
        }
      }, 1000);
    }
  }, [flipped, failSoundRef, onMove]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameOver(true);
    }
  }, [cards]);

  return {
    cards,
    flipCard,
    gameOver,
    reset: () => {
      setCards(initialDeck);
      setFlipped([]);
      setLock(false);
      setGameOver(false);
    },
  };
}
