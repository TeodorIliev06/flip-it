import { useClassicGameLogic } from "./modes/classic";
import { useMemoryMasterGameLogic } from "./modes/memoryMaster";
import { useTimedGameLogic } from "./modes/timed";
import type { IGameModeLogic } from "./modes/IGameModeLogic";
import type { Card as CardType } from "./gameTypes";

export function useGameModeLogic(
  mode: string,
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void,
  onGameOver?: () => void,
  timeLimit: number = 60
): IGameModeLogic & { timeLeft?: number } {
  switch (mode) {
    case "memoryMaster":
      return useMemoryMasterGameLogic(
        deckGenerator,
        failSound,
        onMove,
        onGameOver
      );
    case "timed":
      return useTimedGameLogic(
        deckGenerator,
        failSound,
        onMove,
        onGameOver!,
        timeLimit
      );
    case "classic":
    default:
      return useClassicGameLogic(deckGenerator, failSound, onMove);
  }
}
