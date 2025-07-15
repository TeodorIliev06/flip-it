import { useGameLogic } from "../useGameLogic";

import type { Card as CardType } from "../gameTypes";
import type { IGameModeLogic } from "./IGameModeLogic";

export function useClassicGameLogic(
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void
): IGameModeLogic {
  return useGameLogic(deckGenerator, failSound, onMove);
}
