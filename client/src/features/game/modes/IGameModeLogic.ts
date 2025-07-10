export interface IGameModeLogic {
  onGameStart?: (setState: (s: any) => void) => void;

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
