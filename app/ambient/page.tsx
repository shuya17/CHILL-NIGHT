"use client";

import Box from "@mui/material/Box";
import AmbientPlayer from "../components/AmbientPlayer";

export default function AmbientPage() {
  return (
    <Box
      component="main"
      sx={{ width: "100%", height: "100dvh", overflow: "hidden" }}
    >
      <AmbientPlayer />
    </Box>
  );
}
