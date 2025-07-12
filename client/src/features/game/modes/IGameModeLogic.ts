export interface IGameModeLogic {
  onGameStart?: (
    setCards: (updater: (prev: any[]) => any[]) => void,
    setIsMemorizing: (b: boolean) => void
  ) => void;

  onCardFlip: (params: {
    cards: any[];
    flipped: number[];
    setGameOver: (b: boolean) => void;
    setMistakeMade?: (b: boolean) => void;
    setLock: (b: boolean) => void;
    failSoundRef?: React.RefObject<HTMLAudioElement>;
  }) => void;

  isGameOver?: (cards: any[]) => boolean;
} 
