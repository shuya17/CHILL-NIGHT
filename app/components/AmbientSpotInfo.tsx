"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface AmbientSpotInfoProps {
  name: string;
  prefecture: string;
}

export default function AmbientSpotInfo({
  name,
  prefecture,
}: AmbientSpotInfoProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ color: "common.white", fontWeight: "bold" }}>
        {name}
      </Typography>
      <Typography variant="body2" sx={{ color: "grey.300" }}>
        {prefecture}
      </Typography>
    </Box>
  );
}
