"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
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

  return (
    <>
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

        {/* 上部オーバーレイ: ブランド表示（アンビエントモードと統一） */}
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

        <GeoguesserMap
          onGuessSelect={(lat, lng) => setGuessCoordinate({ lat, lng })}
          onDecide={handleDecide}
        />
      </Box>

      <Dialog open={result !== null} maxWidth="xs" fullWidth>
        {result && currentSpot && (
          <>
            <DialogTitle sx={{ fontWeight: "bold" }}>
              {currentSpot.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentSpot.description}
              </Typography>
              <Typography variant="body1">
                距離: {result.distanceKm.toFixed(1)} km
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
                スコア: {result.score} 点
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                fullWidth
                onClick={() => window.location.reload()}
              >
                もう一度遊ぶ
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
