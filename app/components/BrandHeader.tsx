"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface BrandHeaderProps {
  // 操作パネルの自動フェードアウトに合わせて表示/非表示を切り替えたい場合に指定する（未指定時は常に表示）
  visible?: boolean;
  // 右側に追加の操作（例: 全画面表示ボタン）を配置したい場合に渡す
  endAdornment?: ReactNode;
}

export default function BrandHeader({
  visible = true,
  endAdornment,
}: BrandHeaderProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(rgba(0, 0, 0, 0.55), transparent)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 500ms ease",
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

      {endAdornment}
    </Box>
  );
}
