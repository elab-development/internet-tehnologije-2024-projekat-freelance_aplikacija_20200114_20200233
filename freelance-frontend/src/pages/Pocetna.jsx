import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Slider from "../components/Slider"; // adjust the path if needed

function Pocetna() {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        minHeight: "calc(100vh - 120px)", // adjust according to your NavMenu/Footer heights
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, md: 4 },
        textAlign: "center",
        marginBottom:"30px",
        marginLeft:"110px"
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
        Freelance Marketing: Otključajte Vaš Potencijal
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, maxWidth: 700 }}>
        Dobrodošli na Promo Pulse – platformu koja spaja kreativne freelance
        marketere sa vrhunskim poslovnim prilikama. Povežite se sa klijentima,
        proširite svoje mogućnosti i izgradite uspešnu karijeru u svetu marketinga.
      </Typography>
      
      {/* Reusable slider component */}
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
          onClick={() => navigate("/usluge")}
        >
          Pogledaj Usluge
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

export default Pocetna;
