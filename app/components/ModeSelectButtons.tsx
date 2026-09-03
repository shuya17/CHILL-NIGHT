import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function ModeSelectButtons() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
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
  );
}