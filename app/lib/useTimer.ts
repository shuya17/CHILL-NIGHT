"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Timer {
  remainingMs: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (durationMs?: number) => void;
}

export function useTimer(
  durationMs: number,
  onComplete: () => void,
): Timer {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const remainingRef = useRef(durationMs);
  const deadlineRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning) return;

    const updateRemaining = () => {
      if (deadlineRef.current === null) return;
      const nextRemainingMs = Math.max(0, deadlineRef.current - Date.now());
      remainingRef.current = nextRemainingMs;
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) {
        deadlineRef.current = null;
        setIsPaused(false);
        setIsComplete(true);
        setIsRunning(false);
        onCompleteRef.current();
      }
    };

    const intervalId = setInterval(updateRemaining, 250);
    updateRemaining();
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const start = useCallback(() => {
    if (isRunning) return;
    const nextRemainingMs = isPaused ? remainingRef.current : durationMs;
    if (isComplete || nextRemainingMs <= 0) return;
    remainingRef.current = nextRemainingMs;
    setRemainingMs(nextRemainingMs);
    deadlineRef.current = Date.now() + nextRemainingMs;
    setIsPaused(false);
    setIsComplete(false);
    setIsRunning(true);
  }, [durationMs, isComplete, isPaused, isRunning]);

  const pause = useCallback(() => {
    if (!isRunning || deadlineRef.current === null) return;
    const nextRemainingMs = Math.max(0, deadlineRef.current - Date.now());
    deadlineRef.current = null;
    remainingRef.current = nextRemainingMs;
    setRemainingMs(nextRemainingMs);
    setIsRunning(false);
    if (nextRemainingMs === 0) {
      setIsPaused(false);
      setIsComplete(true);
      onCompleteRef.current();
    } else {
      setIsPaused(true);
    }
  }, [isRunning]);

  const reset = useCallback(
    (nextDurationMs = durationMs) => {
      deadlineRef.current = null;
      remainingRef.current = nextDurationMs;
      setRemainingMs(nextDurationMs);
      setIsRunning(false);
      setIsPaused(true);
      setIsComplete(false);
    },
    [durationMs],
  );

  return {
    remainingMs: isRunning || isPaused || isComplete ? remainingMs : durationMs,
    isRunning,
    start,
    pause,
    reset,
  };
}
