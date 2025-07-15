import { useGameLogic } from "../useGameLogic";
import type { Card as CardType } from "../gameTypes";
import type { IGameModeLogic } from "./IGameModeLogic";
import { useCountdown } from "../../../shared/hooks/useTimer";
import { useState, useEffect, useRef, useCallback } from "react";

export function useTimedGameLogic(
  deckGenerator: () => CardType[],
  failSound: React.MutableRefObject<HTMLAudioElement>,
  onMove: () => void,
  onGameOver: () => void,
  timeLimit: number = 60
): IGameModeLogic & { timeLeft: number } {
  const [resetSignal, setResetSignal] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const initialTimeLimit = useRef(timeLimit);

  const handleTimeout = useCallback(() => {
    setCountdownActive(false);
    onGameOver();
  }, [onGameOver]);

  const timeLeft = useCountdown(countdownActive, initialTimeLimit.current, resetSignal, handleTimeout);
  const base = useGameLogic(deckGenerator, failSound, onMove);

  const flipCard = (idx: number) => {
    if (!gameStarted && !countdownActive) {
      setCountdownActive(true);
      setGameStarted(true);
    }
    base.flipCard(idx);
  };

  const reset = () => {
    base.reset();
    setCountdownActive(false);
    setGameStarted(false);
    setResetSignal((s) => s + 1);
  };

  useEffect(() => {
    if (base.gameOver) {
      setCountdownActive(false);
    }
  }, [base.gameOver]);

  return {
    ...base,
    flipCard,
    reset,
    timeLeft,
  };
}
