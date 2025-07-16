import { useGameLogic } from "../useGameLogic";
import type { Card as CardType } from "../gameTypes";
import type { IGameModeLogic } from "./IGameModeLogic";
import { useCountdown } from "../../../shared/hooks/useTimer";
import { useState, useEffect, useRef, useCallback } from "react";

export function useTimedGameLogic(
  deckGenerator: () => CardType[],
  failSound: React.RefObject<HTMLAudioElement>,
  onMove: () => void,
  onGameOver: () => void,
  timeLimit: number
): IGameModeLogic & { timeLeft: number } {
  const [resetSignal, setResetSignal] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const initialTimeLimit = useRef(timeLimit);

  const base = useGameLogic(deckGenerator, failSound, onMove);

  const handleTimeout = useCallback(() => {
    base.setGameOver(true);
    setCountdownActive(false);
    onGameOver();
  }, [onGameOver, base]);

  const timeLeft = useCountdown(
    countdownActive,
    initialTimeLimit.current,
    resetSignal,
    handleTimeout
  );

  const flipCard = (idx: number) => {
    if (base.gameOver) {
      return;
    }

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
