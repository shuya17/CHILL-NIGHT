"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

export type TimeOfDay = "morning" | "evening" | "night";

export interface TimeOfDayCrossfadeProps {
  images: Partial<Record<TimeOfDay, string>>;
  alt: string;
  intervalMs?: number;
  fadeDurationMs?: number;
}

const TIME_ORDER: TimeOfDay[] = ["morning", "evening", "night"];

// 親要素いっぱいに朝・夕・夜の写真を重ね、一定間隔でクロスフェードさせる。
// 親側で position: relative を指定しておくこと。
// スポットが変わったときは key を変えて再マウントし、読み込み状態をリセットする想定。
export default function TimeOfDayCrossfade({
  images,
  alt,
  intervalMs = 5000,
  fadeDurationMs = 1500,
}: TimeOfDayCrossfadeProps) {
  const { morning, evening, night } = images;
  // 親がインラインのオブジェクトを渡しても再計算されないよう、URL文字列そのものを依存にする
  const phases = useMemo(() => {
    const sources: Record<TimeOfDay, string | undefined> = {
      morning,
      evening,
      night,
    };
    return TIME_ORDER.map((time) => ({ time, src: sources[time] })).filter(
      (phase): phase is { time: TimeOfDay; src: string } =>
        typeof phase.src === "string" && phase.src.trim() !== "",
    );
  }, [morning, evening, night]);

  const [loadedImages, setLoadedImages] = useState<Set<TimeOfDay>>(
    () => new Set(),
  );
  const [failedImages, setFailedImages] = useState<Set<TimeOfDay>>(
    () => new Set(),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const markLoaded = (time: TimeOfDay) => {
    setLoadedImages((previous) =>
      previous.has(time) ? previous : new Set(previous).add(time),
    );
  };

  const markFailed = (time: TimeOfDay) => {
    setFailedImages((previous) =>
      previous.has(time) ? previous : new Set(previous).add(time),
    );
  };

  const availableIndices = useMemo(
    () =>
      phases
        .map((phase, index) => (loadedImages.has(phase.time) ? index : -1))
        .filter((index) => index !== -1),
    [phases, loadedImages],
  );

  // 現在表示できる画像のうち、表示対象となる画像を決める
  const displayIndex = availableIndices.includes(currentIndex)
    ? currentIndex
    : (availableIndices[0] ?? -1);

  // 一定間隔で、読み込みに成功した画像を順番に切り替える
  useEffect(() => {
    if (availableIndices.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        const currentPosition = availableIndices.indexOf(previousIndex);
        const nextPosition =
          currentPosition < 0
            ? 0
            : (currentPosition + 1) % availableIndices.length;

        return availableIndices[nextPosition];
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [availableIndices, intervalMs]);

  const isLoading = loadedImages.size + failedImages.size < phases.length;
  const hasLoadedImage = loadedImages.size > 0;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        bgcolor: "common.black",
        overflow: "hidden",
      }}
    >
      {phases.map((phase, index) => (
        <Box
          key={phase.time}
          component="img"
          src={phase.src}
          alt={index === displayIndex ? alt : ""}
          aria-hidden={index !== displayIndex}
          // キャッシュ済みの画像はハイドレーション前に読み込みが終わり onLoad が発火しないことがあるため、
          // マウント時点で complete になっていれば読み込み済みとして扱う
          ref={(element: HTMLImageElement | null) => {
            if (!element?.complete) return;
            if (element.naturalWidth > 0) {
              markLoaded(phase.time);
            } else {
              markFailed(phase.time);
            }
          }}
          onLoad={() => markLoaded(phase.time)}
          onError={() => markFailed(phase.time)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity:
              loadedImages.has(phase.time) && index === displayIndex ? 1 : 0,
            transition: `opacity ${fadeDurationMs}ms ease-in-out`,
            // Ken Burns効果: 静止画をゆっくり拡大・移動させて「生きている画面」に見せる
            animation: "timeOfDayKenBurns 20s ease-in-out infinite alternate",
            "@keyframes timeOfDayKenBurns": {
              "0%": { transform: "scale(1) translate(0, 0)" },
              "100%": { transform: "scale(1.1) translate(-1.5%, -1.5%)" },
            },
          }}
        />
      ))}

      {!hasLoadedImage && isLoading && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {!hasLoadedImage && !isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.900",
            color: "grey.400",
          }}
        >
          <Typography variant="body2">画像を読み込めませんでした</Typography>
        </Box>
      )}
    </Box>
  );
}
