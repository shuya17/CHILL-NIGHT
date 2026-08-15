import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GeoguesserMap from "./components/GeoguesserMap";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
        CHILL NIGHT
      </Typography>
      <Box sx={{ width: "100%", maxWidth: 800, px: 2 }}>
        <GeoguesserMap />
      </Box>
    </Box>
  );
}

