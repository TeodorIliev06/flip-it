import { useTimedGameLogic } from "./modes/timed";
import { useClassicGameLogic } from "./modes/classic";
import { useMemoryMasterGameLogic } from "./modes/memoryMaster";

import type { Card as CardType } from "./gameTypes";
import type { IGameModeLogic } from "./modes/IGameModeLogic";

import { DEFAULT_TIME_LIMIT } from "./constants";

export function useGameModeLogic(
  mode: string,
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  loseSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void,
  onGameOver?: () => void,
  timeLimit: number = DEFAULT_TIME_LIMIT
): IGameModeLogic & { timeLeft?: number } {
  switch (mode) {
    case "memoryMaster":
      return useMemoryMasterGameLogic(
        deckGenerator,
        loseSound,
        onMove,
        onGameOver
      );
    case "timed":
      return useTimedGameLogic(
        deckGenerator,
        failSound,
        loseSound,
        onMove,
        onGameOver!,
        timeLimit
      );
    case "classic":
    default:
      return useClassicGameLogic(deckGenerator, failSound, onMove);
  }
}
