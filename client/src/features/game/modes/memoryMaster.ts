import { useGameLogic } from "../useGameLogic";
import type { Card as CardType } from "../gameTypes";
import type { IGameModeLogic } from "./IGameModeLogic";

export function useMemoryMasterGameLogic(
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void
): IGameModeLogic {
  // Memorization phase logic
  const MEMORIZE_TIME = 2000;
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

  return {
    ...base,
    isMemorizing: base.isMemorizing,
  };
}
