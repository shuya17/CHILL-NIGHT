import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
        CHILL NIGHT
      </Typography>
    </Box>
  );
}
