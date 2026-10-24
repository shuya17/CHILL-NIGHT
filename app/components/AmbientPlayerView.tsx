"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import type { SelectChangeEvent } from "@mui/material/Select";
import AmbientControls, { AMBIENT_SOUND_OPTIONS } from "./AmbientControls";
import AmbientPhoto, { type ImageStatus } from "./AmbientPhoto";
import AmbientSpotInfo from "./AmbientSpotInfo";
import BrandHeader from "./BrandHeader";
import spotsData from "../../data/spots.json";
import type { Spot } from "../types/spot";

const spots = spotsData as Spot[];

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

// 操作が無いまま経過したら操作パネルを隠す（眺めるだけの画面にするため）
const CONTROLS_HIDE_DELAY_MS = 4000;

export default function AmbientPlayerView() {
  const [spot, setSpot] = useState<Spot>(() => pickRandomSpot());
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  // 初期値はランダムに選び、以降はユーザーがセレクターで自由に指定できる
  const [ambientSrc, setAmbientSrc] = useState<string>(() =>
    pickRandomAmbientSound(),
  );
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 全画面表示はEscキーやブラウザUIからも解除されうるため、実際の状態をイベントで同期する
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  useEffect(() => {
    // マウント時から一定時間操作が無ければパネルを隠し始める
    hideTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      CONTROLS_HIDE_DELAY_MS,
    );
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleActivity = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      CONTROLS_HIDE_DELAY_MS,
    );
  };

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

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <Box
      onPointerMove={handleActivity}
      onClick={handleActivity}
      onKeyDown={handleActivity}
      sx={{
        position: "relative",
        width: "100%",
        // アドレスバーの出没があるモバイルブラウザでも画面いっぱいに表示されるようdvhを使う
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "common.black",
        cursor: controlsVisible ? "default" : "none",
      }}
    >
      <audio ref={audioRef} src={ambientSrc} loop />

      <AmbientPhoto
        key={spot.id}
        src={spot.images.night}
        alt={spot.name}
        status={imageStatus}
        onLoad={() => setImageStatus("loaded")}
        onError={() => setImageStatus("error")}
      />

      <BrandHeader
        visible={controlsVisible}
        endAdornment={
          <IconButton
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "全画面表示を解除" : "全画面表示にする"}
            sx={{
              color: "common.white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        }
      />

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
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? "auto" : "none",
          transition: "opacity 500ms ease",
        }}
      >
        <AmbientSpotInfo name={spot.name} prefecture={spot.prefecture} />

        <AmbientControls
          isPlaying={isPlaying}
          ambientSrc={ambientSrc}
          onNextSpot={handleNextSpot}
          onTogglePlay={handleTogglePlay}
          onSoundChange={handleSoundChange}
        />
      </Box>
    </Box>
  );
}
