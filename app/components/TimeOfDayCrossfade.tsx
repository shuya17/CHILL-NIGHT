
"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

type TimeOfDay = "morning" | "evening" | "night";

interface TimeOfDayCrossfadeProps {
  images: Partial<Record<TimeOfDay, string>>;
  alt: string;
  intervalMs?: number;
  fadeDurationMs?: number;
}

const TIME_ORDER: TimeOfDay[] = ["morning", "evening", "night"];

export default function TimeOfDayCrossfade({
  images,
  alt,
  intervalMs = 5000,
  fadeDurationMs = 1500,
}: TimeOfDayCrossfadeProps) {
  const phases = useMemo(
    () =>
      TIME_ORDER.map((time) => ({
        time,
        src: images[time],
      })).filter(
        (phase): phase is { time: TimeOfDay; src: string } =>
          typeof phase.src === "string" && phase.src.trim() !== "",
      ),
    [images],
  );

  const [loadedImages, setLoadedImages] = useState<Set<TimeOfDay>>(
    new Set(),
  );
  const [failedImages, setFailedImages] = useState<Set<TimeOfDay>>(
    new Set(),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const availableIndices = useMemo(
    () =>
      phases
        .map((phase, index) =>
          loadedImages.has(phase.time) ? index : -1,
        )
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

  const isLoading =
    loadedImages.size + failedImages.size < phases.length;

  const hasLoadedImage = loadedImages.size > 0;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: -1,
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {phases.map((phase, index) => (
        <Box
          key={phase.time}
          component="img"
          src={phase.src}
          alt={alt}
          onLoad={() => {
            setLoadedImages((previous) => {
              const next = new Set(previous);
              next.add(phase.time);
              return next;
            });
          }}
          onError={() => {
            setFailedImages((previous) => {
              const next = new Set(previous);
              next.add(phase.time);
              return next;
            });
          }}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity:
              loadedImages.has(phase.time) && index === displayIndex
                ? 1
                : 0,
            transition: `opacity ${fadeDurationMs}ms ease-in-out`,
          }}
        />
      ))}

      {!hasLoadedImage && isLoading && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
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
            color: "#fff",
          }}
        >
          <Typography variant="body2">
            画像を読み込めませんでした
          </Typography>
        </Box>
      )}
    </Box>
  );
}
