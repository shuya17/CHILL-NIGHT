"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import BrandHeader from "../components/BrandHeader";
import GeoguesserMap from "../components/GeoguesserMap";
import NightViewPhoto from "../components/NightViewPhoto";
import { calculateDistance } from "../lib/distance";
import { calculateScore } from "../lib/score";
import type { Spot } from "../types/spot";

interface GuessResult {
  distanceKm: number;
  score: number;
}

export default function GeoguesserPage() {
  // 答え合わせで使うため、出題中のスポット情報を親で保持しておく
  const [currentSpot, setCurrentSpot] = useState<Spot | null>(null);
  const [guessCoordinate, setGuessCoordinate] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);

  const handleDecide = () => {
    if (!currentSpot || !guessCoordinate) return;

    const distanceKm = calculateDistance(
      guessCoordinate.lat,
      guessCoordinate.lng,
      currentSpot.lat,
      currentSpot.lng,
    );
    const score = calculateScore(distanceKm);
    setResult({ distanceKm, score });
  };

  // resultが変わらない限り参照を安定させ、地図側のポップアップ自動オープンが再発火しないようにする
  const correctAnswer = useMemo(() => {
    if (!result || !currentSpot) return null;
    return {
      lat: currentSpot.lat,
      lng: currentSpot.lng,
      name: currentSpot.name,
      description: currentSpot.description,
      distanceKm: result.distanceKm,
      score: result.score,
    };
  }, [result, currentSpot]);

  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        width: "100%",
        // アドレスバーの出没があるモバイルブラウザでも画面いっぱいに表示されるようdvhを使う
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "common.black",
      }}
    >
      <NightViewPhoto onSpotSelect={setCurrentSpot} />

      <BrandHeader />

      <GeoguesserMap
        onGuessSelect={(lat, lng) => setGuessCoordinate({ lat, lng })}
        onDecide={handleDecide}
        correctAnswer={correctAnswer}
      />
    </Box>
  );
}
