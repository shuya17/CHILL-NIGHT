"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export interface AmbientSpotInfoProps {
  name: string;
  prefecture: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function AmbientSpotInfo({
  name,
  prefecture,
  isFavorite,
  onToggleFavorite,
}: AmbientSpotInfoProps) {
  const favoriteLabel = isFavorite ? "お気に入りから外す" : "お気に入りに追加";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box>
        <Typography
          variant="h5"
          sx={{ color: "common.white", fontWeight: "bold" }}
        >
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: "grey.300" }}>
          {prefecture}
        </Typography>
      </Box>

      <Tooltip title={favoriteLabel}>
        <IconButton
          onClick={onToggleFavorite}
          aria-label={favoriteLabel}
          aria-pressed={isFavorite}
          sx={{
            color: isFavorite ? "#ff6b8b" : "common.white",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
          }}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
