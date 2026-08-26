"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";

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
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
        px: 2,
      }}
    >
      {/* タイトル */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
        CHILL NIGHT
      </Typography>

      {/* アプリの簡単な説明文 */}
      <Typography variant="body1" color="text.secondary">
        リラックスしながら世界を旅したり、環境音を楽しんだりできるアプリです。
        <br />
        お好きなモードを選んでください。
      </Typography>

      {/* 案内ボタンのコンテナ */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          // スマホ（xs）では縦並び、PC（sm以上）では横並びになるレスポンシブ対応
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          variant="contained"
          size="large"
          component={Link}
          href="/geoguesser"
        >
          ジオゲッサーで遊ぶ
        </Button>
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href="/ambient"
        >
          アンビエントモードを見る
        </Button>
      </Box>
    </Box>
  );
}
