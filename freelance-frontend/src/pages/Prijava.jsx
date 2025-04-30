import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function Prijava() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Neuspešna prijava. Pokušajte ponovo.");
      }
      
      // Destructure token and user from the response
      const { token, user } = data;
      
      // Store token and user name in sessionStorage
      sessionStorage.setItem("userToken", token);
      sessionStorage.setItem("userName", user.name);
      sessionStorage.setItem("userRole", user.role);
      
      alert("Uspešno ste prijavljeni!");
      if(user.role === "kupac"){
        navigate("/pocetna");
      }else{
        navigate("/pocetna-ponudjac");
      }
    } catch (error) {
      setError(error.message || "Došlo je do greške. Pokušajte ponovo.");
    }
  };

  return (
    <Box className="background-container">
      <Box className="content">
        <Paper elevation={4} className="prijava-paper">
          <Box className="logo-box">
            <img
              src="/assets/logo.png"
              alt="Promo Pulse Logo"
              className="logo-image"
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Dobro došli! Molimo da se prijavite.
          </Typography>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              required
              fullWidth
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />

            <TextField
              required
              fullWidth
              type="password"
              name="password"
              label="Lozinka"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />

            <MuiButton
              type="submit"
              variant="contained"
              startIcon={<LoginIcon />}
              className="prijava-button"
            >
              Prijavi se
            </MuiButton>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Nemate nalog?{" "}
            <MuiButton
              variant="text"
              startIcon={<PersonAddIcon />}
              className="link-button"
              onClick={() => navigate("/registracija")}
            >
              Registrujte se
            </MuiButton>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default Prijava;
