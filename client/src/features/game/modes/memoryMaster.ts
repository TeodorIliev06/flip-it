import { useState, useEffect } from "react";

import { useGameLogic } from "../useGameLogic";

import type { Card as CardType } from "../gameTypes";
import type { IGameModeLogic } from "./IGameModeLogic";

import { MEMORIZE_TIME } from "../constants";

export function useMemoryMasterGameLogic(
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void,
  onGameOver?: () => void
): IGameModeLogic {
  // Memorization phase logic
  const [mistakeMade, setMistakeMade] = useState(false);

  const onInit = (
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>,
    setIsMemorizing?: (b: boolean) => void
  ) => {
    if (!setIsMemorizing) return;
    setIsMemorizing(true);
    setCards((prev: CardType[]) =>
      prev.map((card: CardType) => ({ ...card, isFlipped: true }))
    );
    setTimeout(() => {
      setCards((prev: CardType[]) =>
        prev.map((card: CardType) => ({ ...card, isFlipped: false }))
      );
      setIsMemorizing(false);
    }, MEMORIZE_TIME);
  };
  const onReset = onInit;

  const base = useGameLogic(deckGenerator, failSound, onMove, {
    onInit,
    onReset,
    isMemorizing: undefined, // will be set from base
  });

  const flipCard = (idx: number) => {
    if (base.gameOver || mistakeMade) {
      return;
    }

    base.flipCard(idx);
  };

  useEffect(() => {
    const flippedCards = base.cards.filter((c) => c.isFlipped && !c.isMatched);
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first.value !== second.value) {
        setMistakeMade(true);
        setTimeout(() => {
          base.setGameOver(true);
          if (onGameOver) onGameOver();
        }, 1000);
      }
    }
  }, [base.cards, base, onGameOver]);

  // Reset mistakeMade and gameOver on reset
  useEffect(() => {
    setMistakeMade(false);
  }, [deckGenerator]);

  return {
    ...base,
    flipCard,
    isMemorizing: base.isMemorizing,
  };
}
