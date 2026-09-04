"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import spotsData from "../../data/spots.json";
import type { Spot } from "../types/spot";

const spots = spotsData as Spot[];

function pickRandomSpot(): Spot {
  return spots[Math.floor(Math.random() * spots.length)];
}

type ImageStatus = "loading" | "loaded" | "error";

export interface NightViewPhotoProps {
  // ランダムに選ばれたスポット情報を親コンポーネントに通知する
  onSpotSelect?: (spot: Spot) => void;
}

export default function NightViewPhoto({ onSpotSelect }: NightViewPhotoProps) {
  const [spot] = useState<Spot>(() => pickRandomSpot());
  const [status, setStatus] = useState<ImageStatus>("loading");

  useEffect(() => {
    onSpotSelect?.(spot);
    // 初回選出時のみ親へ通知すればよいため spot は依存に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {status === "loading" && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: "absolute", inset: 0 }}
        />
      )}

      {status === "error" ? (
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
      ) : (
        <Box
          component="img"
          src={spot.images.night}
          alt={spot.name}
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
