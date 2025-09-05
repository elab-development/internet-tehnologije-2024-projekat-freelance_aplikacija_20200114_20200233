import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Slider from "../../components/Slider"; // Adjust the path if needed

function PocetnaProdavac() {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, md: 4 },
        textAlign: "center",
        marginBottom: "30px",
        marginLeft: "110px",
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
        Istaknite svoje veštine i privucite klijente
      </Typography>

      <Typography variant="h5" sx={{ mb: 4, maxWidth: 700 }}>
        Pridružite se Promo Pulse zajednici i ponudite svoje usluge širom
        tržišta. Kreirajte svoj profil, predstavite se profesionalno i budite
        deo moderne freelance ekonomije.
      </Typography>

      {/* Slider section */}
      <Slider />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          mt: 4,
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#D42700",
            color: "#fff",
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            py: 1.5,
            "&:hover": { backgroundColor: "#c03300" },
          }}
          onClick={() => navigate("/moje-usluge")}
        >
          Kreiraj Uslugu
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#D42700",
            color: "#D42700",
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            py: 1.5,
            "&:hover": { borderColor: "#c03300", color: "#c03300" },
          }}
          onClick={() => navigate("/onama")}
        >
          Više O Nama
        </Button>
      </Box>
    </Box>
  );
}

export default PocetnaProdavac;
