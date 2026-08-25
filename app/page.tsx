"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GeoguesserMap from "./components/GeoguesserMap";
import NightViewPhoto from "./components/NightViewPhoto";
import type { Spot } from "./types/spot";

export default function Home() {
  // 答え合わせで使うため、出題中のスポット情報を親で保持しておく
  const [currentSpot, setCurrentSpot] = useState<Spot | null>(null);

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
          <GeoguesserMap />
        </Box>
      </Box>
    </>
  );
}
