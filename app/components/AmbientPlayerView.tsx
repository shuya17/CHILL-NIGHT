"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import TimerIcon from "@mui/icons-material/Timer";
import TimerOffIcon from "@mui/icons-material/TimerOff";
import type { SelectChangeEvent } from "@mui/material/Select";
import AmbientControls, { AMBIENT_SOUND_OPTIONS } from "./AmbientControls";
import AmbientSpotInfo from "./AmbientSpotInfo";
import BrandHeader from "./BrandHeader";
import PomodoroTimer from "./PomodoroTimer";
import TimeOfDayCrossfade from "./TimeOfDayCrossfade";
import { getFavorites, toggleFavorite } from "../lib/favorites";
import spotsData from "../../data/spots.json";
import type { Spot } from "../types/spot";

const spots = spotsData as Spot[];

// candidates の中からランダムに選ぶ（候補が2件以上あれば excludeId 以外を選ぶ）
function pickRandomSpot(excludeId?: string, candidates: Spot[] = spots): Spot {
  if (candidates.length === 1) return candidates[0];
  let next: Spot;
  do {
    next = candidates[Math.floor(Math.random() * candidates.length)];
  } while (excludeId && next.id === excludeId);
  return next;
}

function pickRandomAmbientSound(): string {
  const options = AMBIENT_SOUND_OPTIONS;
  return options[Math.floor(Math.random() * options.length)].value;
}

// 操作が無いまま経過したら操作パネルを隠す（眺めるだけの画面にするため）
const CONTROLS_HIDE_DELAY_MS = 4000;

// 朝・夕・夜の写真を切り替える間隔とフェード時間（ながら見向けにゆっくりめ）
const TIME_OF_DAY_INTERVAL_MS = 15000;
const TIME_OF_DAY_FADE_MS = 3000;

export default function AmbientPlayerView() {
  const [spot, setSpot] = useState<Spot>(() => pickRandomSpot());
  const [isPlaying, setIsPlaying] = useState(false);
  // タイマーは操作パネルが隠れても残り時間を確認できるよう常時表示し、不要ならヘッダーから隠せる
  const [timerVisible, setTimerVisible] = useState(true);
  // この画面はクライアントのみで描画されるため、初期化時に localStorage を直接読める
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    getFavorites(),
  );
  const [favoritesOnly, setFavoritesOnly] = useState(false);
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
    const favoriteSpots = spots.filter((s) => favoriteIds.includes(s.id));
    // お気に入りが全て解除された場合は全スポットから選ぶ
    const candidates =
      favoritesOnly && favoriteSpots.length > 0 ? favoriteSpots : spots;
    setSpot((current) => pickRandomSpot(current.id, candidates));
  };

  const handleToggleFavorite = () => {
    toggleFavorite(spot.id);
    setFavoriteIds(getFavorites());
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

      <TimeOfDayCrossfade
        key={spot.id}
        images={spot.images}
        alt={spot.name}
        intervalMs={TIME_OF_DAY_INTERVAL_MS}
        fadeDurationMs={TIME_OF_DAY_FADE_MS}
      />

      <BrandHeader
        visible={controlsVisible}
        endAdornment={
          <Box sx={{ display: "flex" }}>
            <IconButton
              onClick={() => setTimerVisible((visible) => !visible)}
              aria-label={timerVisible ? "タイマーを隠す" : "タイマーを表示"}
              sx={{
                color: "common.white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
              }}
            >
              {timerVisible ? <TimerOffIcon /> : <TimerIcon />}
            </IconButton>
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
          </Box>
        }
      />

      {/* 非表示中もカウントを止めないよう、アンマウントせず display で隠す */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 64, sm: 72 },
          right: { xs: 16, sm: 24 },
          display: timerVisible ? "block" : "none",
        }}
      >
        <PomodoroTimer />
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
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? "auto" : "none",
          transition: "opacity 500ms ease",
        }}
      >
        <AmbientSpotInfo
          name={spot.name}
          prefecture={spot.prefecture}
          isFavorite={favoriteIds.includes(spot.id)}
          onToggleFavorite={handleToggleFavorite}
        />

        <AmbientControls
          isPlaying={isPlaying}
          ambientSrc={ambientSrc}
          onNextSpot={handleNextSpot}
          onTogglePlay={handleTogglePlay}
          onSoundChange={handleSoundChange}
          favoritesOnly={favoritesOnly}
          hasFavorites={favoriteIds.length > 0}
          onFavoritesOnlyChange={setFavoritesOnly}
        />
      </Box>
    </Box>
  );
}
