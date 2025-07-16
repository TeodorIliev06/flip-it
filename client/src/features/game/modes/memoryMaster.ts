import { useState, useEffect, useRef } from "react";

import { useGameLogic } from "../useGameLogic";

import type { Card as CardType } from "../gameTypes";
import type { IGameModeLogic } from "./IGameModeLogic";

import { MEMORIZE_TIME } from "../constants";

export function useMemoryMasterGameLogic(
  deckGenerator: () => CardType[],
  loseSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void,
  onGameOver?: () => void
): IGameModeLogic {
  // Memorization phase logic
  const [mistakeMade, setMistakeMade] = useState(false);

  const loseSoundPlayed = useRef(false);

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

  const base = useGameLogic(deckGenerator, onMove, null, {
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
    if (base.gameOver) {
      loseSoundPlayed.current = false;
      return;
    }
    const flippedCards = base.cards.filter((c) => c.isFlipped && !c.isMatched);
    if (
      flippedCards.length === 2 &&
      flippedCards[0].value !== flippedCards[1].value &&
      !loseSoundPlayed.current
    ) {
      setMistakeMade(true);

      if (loseSound.current) {
        loseSound.current.currentTime = 0;
        loseSound.current.play();
      }

      loseSoundPlayed.current = true;
      base.setGameOver(true);

      if (onGameOver) {
        onGameOver();
      }
    }
  }, [base.cards, base, onGameOver, loseSound]);

  useEffect(() => {
    setMistakeMade(false);
    loseSoundPlayed.current = false;
  }, [deckGenerator]);

  return {
    ...base,
    flipCard,
    isMemorizing: base.isMemorizing,
  };
}
