"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

export type ImageStatus = "loading" | "loaded" | "error";

export interface AmbientPhotoProps {
  src: string;
  alt: string;
  status: ImageStatus;
  onLoad: () => void;
  onError: () => void;
}

export default function AmbientPhoto({
  src,
  alt,
  status,
  onLoad,
  onError,
}: AmbientPhotoProps) {
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
          src={src}
          alt={alt}
          onLoad={onLoad}
          onError={onError}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            visibility: status === "loaded" ? "visible" : "hidden",
            // Ken Burns効果: 静止画をゆっくり拡大・移動させて「生きている画面」に見せる
            animation:
              status === "loaded"
                ? "ambientKenBurns 20s ease-in-out infinite alternate"
                : "none",
            "@keyframes ambientKenBurns": {
              "0%": { transform: "scale(1) translate(0, 0)" },
              "100%": { transform: "scale(1.1) translate(-1.5%, -1.5%)" },
            },
          }}
        />
      )}
    </>
  );
}
