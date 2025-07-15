import type { Card as CardType } from "../gameTypes";

export interface IGameModeLogic {
  cards: CardType[];
  flipCard: (idx: number) => void;
  gameOver: boolean;
  lock: boolean;
  reset: () => void;

  // Optional mode-specific flags
  isMemorizing?: boolean;
}
