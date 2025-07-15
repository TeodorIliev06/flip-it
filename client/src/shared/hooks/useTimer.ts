import { useEffect, useRef, useState } from "react";

export function useTimer(active: boolean, resetSignal: any) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, resetSignal]);

  useEffect(() => {
    setSeconds(0);
  }, [resetSignal]);

  return seconds;
}

export function useCountdown(
  active: boolean,
  start: number,
  resetSignal: any,
  onTimeout?: () => void
) {
  const [timeLeft, setTimeLeft] = useState(start);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastResetSignal = useRef(resetSignal);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (resetSignal !== lastResetSignal.current) {
      setTimeLeft(start);
      lastResetSignal.current = resetSignal;
    }
  }, [resetSignal, start]);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      return; // Prevent multiple intervals
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (onTimeoutRef.current) {
            onTimeoutRef.current();
          }
          return 0;
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active]);

  return timeLeft;
}
