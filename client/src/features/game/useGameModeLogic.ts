import { useTimedGameLogic } from "./modes/timed";
import { useClassicGameLogic } from "./modes/classic";
import { useMemoryMasterGameLogic } from "./modes/memoryMaster";

import type { Card as CardType } from "./gameTypes";
import type { IGameModeLogic } from "./modes/IGameModeLogic";

import { DEFAULT_TIME_LIMIT, GAME_MODE_KEYS } from "./constants";

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
    case GAME_MODE_KEYS.MEMORY_MASTER:
      return useMemoryMasterGameLogic(
        deckGenerator,
        loseSound,
        onMove,
        onGameOver
      );
    case GAME_MODE_KEYS.TIMED:
      return useTimedGameLogic(
        deckGenerator,
        failSound,
        loseSound,
        onMove,
        onGameOver!,
        timeLimit
      );
    case GAME_MODE_KEYS.CLASSIC:
    default:
      return useClassicGameLogic(deckGenerator, failSound, onMove);
  }
}
