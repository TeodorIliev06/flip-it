import type { IGameModeLogic } from "./IGameModeLogic";

export const MemoryMasterModeLogic: IGameModeLogic = {
  onGameStart: (setCards, setIsMemorizing) => {
    // Flip all cards up and start memorization
    setIsMemorizing(true);
    setCards((prev) => prev.map((c: any) => ({ ...c, isFlipped: true })));
    setTimeout(() => {
      setIsMemorizing(false);
      setCards((prev) => prev.map((c: any) => ({ ...c, isFlipped: false })));
    }, 4000); // 4 seconds to memorize
  },
  onCardFlip: ({ cards, flipped, setGameOver, setMistakeMade, setLock, failSoundRef }) => {
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
          setMistakeMade && setMistakeMade(true);
          setGameOver(true);
        }
        setLock(false);
      }, 1000);
    }
  },
  isGameOver: (cards) => cards.length > 0 && cards.every((card: any) => card.isMatched),
}; 
