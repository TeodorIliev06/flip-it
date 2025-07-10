import type { IGameModeLogic } from "./IGameModeLogic";

export const ClassicModeLogic: IGameModeLogic = {
  onCardFlip: ({ cards, flipped, setGameOver, setLock, failSoundRef }) => {
    if (flipped.length === 2) {
      setLock(true);
      const [i, j] = flipped;
      setTimeout(() => {
        if (cards[i].value === cards[j].value) {
        } else {
          if (failSoundRef && failSoundRef.current) {
            failSoundRef.current.currentTime = 0;
            failSoundRef.current.play();
          }
        }
        setLock(false);
      }, 1000);
    }
  },
  isGameOver: (cards) => cards.length > 0 && cards.every((card: any) => card.isMatched),
}; 
