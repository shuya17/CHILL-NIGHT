"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";

export interface AmbientSoundOption {
  value: string;
  label: string;
}

// 環境音、BGM
export const AMBIENT_SOUND_OPTIONS: AmbientSoundOption[] = [
  { value: "/sounds/insects_sound_01.mp3", label: "虫の声 A" },
  { value: "/sounds/insects_sound_02.mp3", label: "虫の声 B" },
  { value: "/sounds/wave_sound_01.mp3", label: "波音 A" },
  { value: "/sounds/wave_sound_02.mp3", label: "波音 B" },
  { value: "/sounds/wind_sound_01.mp3", label: "風の音 A" },
  { value: "/sounds/wind_sound_02.mp3", label: "風の音 B" },
  { value: "/sounds/birds_sound_01.mp3", label: "鳥のさえずり A" },
  { value: "/sounds/birds_sound_02.mp3", label: "鳥のさえずり B" },
  { value: "/sounds/river_sound_01.mp3", label: "川のせせらぎ A" },
  { value: "/sounds/river_sound_02.mp3", label: "川のせせらぎ B" },
  { value: "/sounds/rain_sound_01.mp3", label: "雨音 A" },
  { value: "/sounds/rain_sound_02.mp3", label: "雨音 B" },
  { value: "/sounds/night_city_sound_01.mp3", label: "夜の街 A" },
  { value: "/sounds/night_city_sound_02.mp3", label: "夜の街 B" },
];

export interface AmbientControlsProps {
  isPlaying: boolean;
  ambientSrc: string;
  onNextSpot: () => void;
  onTogglePlay: () => void;
  onSoundChange: (event: SelectChangeEvent) => void;
}

export default function AmbientControls({
  isPlaying,
  ambientSrc,
  onNextSpot,
  onTogglePlay,
  onSoundChange,
}: AmbientControlsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Button variant="contained" size="large" onClick={onNextSpot}>
        次のスポットへ
      </Button>
      <Button
        variant="outlined"
        size="large"
        onClick={onTogglePlay}
        sx={{
          color: "common.white",
          borderColor: "rgba(255, 255, 255, 0.5)",
          "&:hover": { borderColor: "common.white" },
        }}
      >
        {isPlaying ? "環境音を停止" : "環境音を再生"}
      </Button>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={ambientSrc}
          onChange={onSoundChange}
          sx={{
            color: "common.white",
            bgcolor: "rgba(255, 255, 255, 0.08)",
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "common.white",
            },
            ".MuiSvgIcon-root": { color: "common.white" },
          }}
          MenuProps={{
            slotProps: { paper: { sx: { bgcolor: "grey.900" } } },
          }}
        >
          {AMBIENT_SOUND_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ color: "common.white" }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
