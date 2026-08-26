"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import GeoguesserMap from "./components/GeoguesserMap";
import NightViewPhoto from "./components/NightViewPhoto";
import { calculateDistance } from "./lib/distance";
import { calculateScore } from "./lib/score";
import type { Spot } from "./types/spot";

interface GuessResult {
  distanceKm: number;
  score: number;
}

export default function Home() {
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
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          width: "100%",
          py: 1.5,
          textAlign: "center",
          bgcolor: "rgba(18, 18, 18, 0.72)",
          backdropFilter: "blur(8px)",
          boxShadow: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "common.white" }}
        >
          CHILL NIGHT
        </Typography>
      </Box>
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          pb: 6,
        }}
      >
        <Box sx={{ width: { xs: "100%", sm: "97%" }, maxWidth: 1200 }}>
          <NightViewPhoto onSpotSelect={setCurrentSpot} />
        </Box>
        <Box sx={{ width: "100%", maxWidth: 800, px: 2 }}>
          <GeoguesserMap
            onGuessSelect={(lat, lng) => setGuessCoordinate({ lat, lng })}
            onDecide={handleDecide}
          />
        </Box>
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
