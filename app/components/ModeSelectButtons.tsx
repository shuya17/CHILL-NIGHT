import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";

// すりガラス風（グラスモーフィズム）ボタンの共通スタイル
const glassButtonSx = {
  color: "white",
  bgcolor: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "16px",
  fontSize: { xs: "1.15rem", sm: "1.4rem" },
  px: { xs: 3, sm: 5 },
  py: { xs: 1.5, sm: 2 },
  "&:hover": {
    bgcolor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
} as const;

export default function ModeSelectButtons() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 2, sm: 6 },
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Button
        variant="contained"
        size="large"
        component={Link}
        href="/geoguesser"
        sx={glassButtonSx}
      >
        夜景クイズで遊ぶ
      </Button>

      <Button
        variant="outlined"
        size="large"
        component={Link}
        href="/ambient"
        sx={glassButtonSx}
      >
        アンビエントモードを見る
      </Button>
    </Box>
  );
}