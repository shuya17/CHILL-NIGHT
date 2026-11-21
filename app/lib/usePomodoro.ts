"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTimer, type Timer } from "./useTimer";

export type PomodoroMode = "work" | "shortBreak" | "longBreak";
export type PomodoroSetting =
  | "workMinutes"
  | "shortBreakMinutes"
  | "longBreakMinutes"
  | "longBreakInterval";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

const INITIAL_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

const MINUTE_IN_MS = 60_000;

function getDurationMs(mode: PomodoroMode, settings: PomodoroSettings) {
  const minutes =
    mode === "work"
      ? settings.workMinutes
      : mode === "shortBreak"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return minutes * MINUTE_IN_MS;
}

export function usePomodoro() {
  const [settings, setSettings] =
    useState<PomodoroSettings>(INITIAL_SETTINGS);
  const [mode, setMode] = useState<PomodoroMode>("work");
  const [completedSessions, setCompletedSessions] = useState(0);
  const resetTimerRef = useRef<Timer["reset"]>(() => {});
  const completionHandlerRef = useRef<() => void>(() => {});
  const timer = useTimer(
    getDurationMs(mode, settings),
    () => completionHandlerRef.current(),
  );
  const { isRunning, pause, remainingMs, reset: resetTimer, start } = timer;

  useEffect(() => {
    resetTimerRef.current = resetTimer;
    completionHandlerRef.current = () => {
      if (mode === "work") {
        const nextCompletedSessions = completedSessions + 1;
        const nextMode =
          nextCompletedSessions % settings.longBreakInterval === 0
            ? "longBreak"
            : "shortBreak";
        setCompletedSessions(nextCompletedSessions);
        setMode(nextMode);
        resetTimerRef.current(getDurationMs(nextMode, settings));
        return;
      }

      setMode("work");
      resetTimerRef.current(getDurationMs("work", settings));
    };
  }, [completedSessions, mode, resetTimer, settings]);

  const updateSetting = useCallback(
    (setting: PomodoroSetting, value: number) => {
      if (!Number.isInteger(value) || value < 1) return;

      const nextSettings = { ...settings, [setting]: value };
      setSettings(nextSettings);

      const activeSetting =
        mode === "work"
          ? "workMinutes"
          : mode === "shortBreak"
            ? "shortBreakMinutes"
            : "longBreakMinutes";
      // 未開始のセッションだけ新しい時間に差し替える
      // （一時停止中に設定を変えても、途中までの残り時間は失わないようにする）
      const isUntouched =
        !isRunning && remainingMs === getDurationMs(mode, settings);
      if (setting === activeSetting && isUntouched) {
        resetTimer(getDurationMs(mode, nextSettings));
      }
    },
    [isRunning, mode, remainingMs, resetTimer, settings],
  );

  const reset = useCallback(() => {
    setMode("work");
    setCompletedSessions(0);
    resetTimer(getDurationMs("work", settings));
  }, [resetTimer, settings]);

  return {
    mode,
    remainingMs,
    isRunning,
    completedSessions,
    settings,
    start,
    pause,
    reset,
    updateSetting,
  };
}
