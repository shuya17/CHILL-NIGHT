"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import spotsData from "../../data/spots.json";
import type { Spot } from "../types/spot";

const spots = spotsData as Spot[];

// 「虫の声・波音など」の環境音のみを対象にする（BGM系トラックは対象外）
const AMBIENT_SOUND_OPTIONS = [
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
] as const;

function pickRandomSpot(excludeId?: string): Spot {
  if (spots.length === 1) return spots[0];
  let next: Spot;
  do {
    next = spots[Math.floor(Math.random() * spots.length)];
  } while (excludeId && next.id === excludeId);
  return next;
}

function pickRandomAmbientSound(): string {
  const options = AMBIENT_SOUND_OPTIONS;
  return options[Math.floor(Math.random() * options.length)].value;
}

type ImageStatus = "loading" | "loaded" | "error";

export default function AmbientPlayerView() {
  const [spot, setSpot] = useState<Spot>(() => pickRandomSpot());
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  // 初期値はランダムに選び、以降はユーザーがセレクターで自由に指定できる
  const [ambientSrc, setAmbientSrc] = useState<string>(() =>
    pickRandomAmbientSound(),
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // 「操作不要で眺めるだけ」を実現するため自動再生を試みるが、
    // ブラウザの自動再生ポリシーでブロックされることがあるため、失敗時は静かに一時停止状態にする
    // （ユーザーが環境音を切り替えたときも同じ効果で再読み込み・再生を試みる）
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [ambientSrc]);

  const handleNextSpot = () => {
    setImageStatus("loading");
    setSpot((current) => pickRandomSpot(current.id));
  };

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSoundChange = (event: SelectChangeEvent) => {
    setAmbientSrc(event.target.value);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        // アドレスバーの出没があるモバイルブラウザでも画面いっぱいに表示されるようdvhを使う
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "common.black",
      }}
    >
      <audio ref={audioRef} src={ambientSrc} loop />

      {imageStatus === "loading" && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: "absolute", inset: 0 }}
        />
      )}

      {imageStatus === "error" ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            bgcolor: "grey.900",
            color: "grey.400",
          }}
        >
          <Typography variant="body2">画像を読み込めませんでした</Typography>
        </Box>
      ) : (
        <Box
          component="img"
          src={spot.images.night}
          alt={spot.name}
          onLoad={() => setImageStatus("loaded")}
          onError={() => setImageStatus("error")}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            visibility: imageStatus === "loaded" ? "visible" : "hidden",
          }}
        />
      )}

      {/* 上部オーバーレイ: ブランド表示（トップページへの導線を兼ねる） */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          px: 2,
          py: 1.5,
          background: "linear-gradient(rgba(0, 0, 0, 0.55), transparent)",
        }}
      >
        <Typography
          component={Link}
          href="/"
          variant="h6"
          sx={{
            color: "common.white",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          CHILL NIGHT
        </Typography>
      </Box>

      {/* 下部オーバーレイ: スポット情報と操作パネル */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          background: "linear-gradient(transparent, rgba(0, 0, 0, 0.85))",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: "common.white", fontWeight: "bold" }}
          >
            {spot.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.300" }}>
            {spot.prefecture}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button variant="contained" size="large" onClick={handleNextSpot}>
            次のスポットへ
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleTogglePlay}
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
              onChange={handleSoundChange}
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
      </Box>
    </Box>
  );
}
