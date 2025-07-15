import { useClassicGameLogic } from "./modes/classic";
import { useMemoryMasterGameLogic } from "./modes/memoryMaster";
import type { IGameModeLogic } from "./modes/IGameModeLogic";
import type { Card as CardType } from "./gameTypes";

export function useGameModeLogic(
  mode: string,
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void
): IGameModeLogic {
  switch (mode) {
    case "memoryMaster":
      return useMemoryMasterGameLogic(deckGenerator, failSound, onMove);
    case "classic":
    default:
      return useClassicGameLogic(deckGenerator, failSound, onMove);
  }
} 
