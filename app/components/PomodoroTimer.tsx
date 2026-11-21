"use client";

import { useState, type MouseEvent } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  usePomodoro,
  type PomodoroMode,
  type PomodoroSetting,
} from "../lib/usePomodoro";

const MODE_LABELS: Record<PomodoroMode, string> = {
  work: "作業中",
  shortBreak: "小休憩",
  longBreak: "長休憩",
};

const SETTING_FIELDS: { key: PomodoroSetting; label: string; max: number }[] =
  [
    { key: "workMinutes", label: "作業（分）", max: 120 },
    { key: "shortBreakMinutes", label: "小休憩（分）", max: 60 },
    { key: "longBreakMinutes", label: "長休憩（分）", max: 60 },
    { key: "longBreakInterval", label: "長休憩までの回数", max: 10 },
  ];

function formatRemaining(remainingMs: number) {
  // 残り0.1秒などで「00:00」にならないよう切り上げる
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const iconButtonSx = {
  color: "common.white",
  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
};

export default function PomodoroTimer() {
  const {
    mode,
    remainingMs,
    isRunning,
    completedSessions,
    settings,
    start,
    pause,
    reset,
    updateSetting,
  } = usePomodoro();
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(
    null,
  );

  const handleOpenSettings = (event: MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  return (
    <Box
      role="timer"
      aria-label={`${MODE_LABELS[mode]} 残り${formatRemaining(remainingMs)}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        borderRadius: 2,
        color: "common.white",
        bgcolor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{ display: "block", color: mode === "work" ? "grey.300" : "#9fd8ff" }}
        >
          {MODE_LABELS[mode]}・完了 {completedSessions}
        </Typography>
        <Typography
          variant="h5"
          component="span"
          sx={{ fontVariantNumeric: "tabular-nums", fontWeight: "bold" }}
        >
          {formatRemaining(remainingMs)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex" }}>
        <Tooltip title={isRunning ? "一時停止" : "開始"}>
          <IconButton
            onClick={isRunning ? pause : start}
            aria-label={isRunning ? "一時停止" : "開始"}
            sx={iconButtonSx}
          >
            {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="リセット">
          <IconButton onClick={reset} aria-label="リセット" sx={iconButtonSx}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="時間設定">
          <IconButton
            onClick={handleOpenSettings}
            aria-label="時間設定"
            sx={iconButtonSx}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={settingsAnchor !== null}
        anchorEl={settingsAnchor}
        onClose={() => setSettingsAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 2 } } }}
      >
        <Box sx={{ display: "grid", gap: 2, width: 200 }}>
          {SETTING_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              type="number"
              size="small"
              value={settings[field.key]}
              onChange={(event) =>
                updateSetting(
                  field.key,
                  Math.min(field.max, Number(event.target.value)),
                )
              }
              slotProps={{ htmlInput: { min: 1, max: field.max, step: 1 } }}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
}
