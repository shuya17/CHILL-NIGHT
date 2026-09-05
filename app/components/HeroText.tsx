import Typography from "@mui/material/Typography";

export default function HeroText() {
  return (
    <Typography
      variant="h2"
      component="h1"
      sx={{
        fontWeight: "bold",
        color: "white",
        fontSize: { xs: "2.75rem", sm: "3.75rem", md: "4.5rem" },
      }}
    >
      CHILL NIGHT
    </Typography>
  );
}