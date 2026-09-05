"use client";

import Box from "@mui/material/Box";
import NightViewCrossfade from "./components/NightViewCrossfade";
import HeroText from "./components/HeroText";
import DescriptionText from "./components/DescriptionText";
import ModeSelectButtons from "./components/ModeSelectButtons";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        // ヘッダーの高さを考慮して、少し余裕を持たせた高さに調整
        minHeight: "80vh",
        alignItems: "center",
        // タイトル群を上へ、ボタン群を下へ離すため space-between にする
        justifyContent: "space-between",
        textAlign: "center",
        px: 2,
        pt: { xs: 14, sm: 20 },
        pb: { xs: 6, sm: 10 },
      }}
    >
      {/* 背景コンポーネント */}
      <NightViewCrossfade />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <HeroText />
        <DescriptionText />
      </Box>

      <ModeSelectButtons />
    </Box>
  );
}
