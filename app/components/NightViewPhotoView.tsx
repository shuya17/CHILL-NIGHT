"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

type ImageStatus = "loading" | "loaded" | "error";

export interface NightViewPhotoProps {
  // 出題中の写真URL（取得中は null）。スポット名がURLやaltに出ないよう、親から受け取るだけにする
  src: string | null;
  // 問題の取得自体に失敗した場合
  hasError?: boolean;
}

export default function NightViewPhoto({ src, hasError = false }: NightViewPhotoProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");

  if (hasError || status === "error") {
    return (
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          bgcolor: "grey.900",
          color: "grey.400",
        }}
      >
        <Typography variant="body2">画像を読み込めませんでした</Typography>
      </Box>
    );
  }

  return (
    <>
      {status === "loading" && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: "absolute", inset: 0 }}
        />
      )}

      {src && (
        <Box
          component="img"
          src={src}
          // alt にスポット名を入れると検証ツールで答えが見えてしまうため、汎用の文言にする
          alt="出題中の夜景写真"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            visibility: status === "loaded" ? "visible" : "hidden",
          }}
        />
      )}
    </>
  );
}
