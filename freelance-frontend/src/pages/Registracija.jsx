import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button as MuiButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";

function Registracija() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kupac",
  });

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
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Došlo je do greške prilikom registracije.");
      }
      alert("Uspešna registracija! Možete se sada prijaviti.");
      navigate("/prijava");
    } catch (error) {
      setError(error.message || "Nešto nije u redu. Pokušajte ponovo.");
    }
  };

  return (
    <Box className="background-container">
      {/* Content layered above the background GIF */}
      <Box className="content">
        <Paper elevation={4} className="registracija-paper">
          <Box className="logo-box">
            <img
              src="/assets/logo.png"
              alt="Promo Pulse Logo"
              className="logo-image"
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Kreirajte nalog i pridružite nam se!
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
              name="name"
              label="Ime i prezime"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />

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

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="role-label">Uloga</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                label="Uloga"
                onChange={handleChange}
              >
                <MenuItem value="kupac">Kupac</MenuItem>
                <MenuItem value="ponudjac">Ponuđač</MenuItem>
              </Select>
            </FormControl>

            <MuiButton
              type="submit"
              variant="contained"
              startIcon={<PersonAddIcon />}
              className="registracija-button"
              sx={{ mt: 2 }}
            >
              Registruj se
            </MuiButton>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Već imate nalog?{" "}
            <MuiButton
              variant="text"
              startIcon={<LoginIcon />}
              className="link-button"
              onClick={() => navigate("/prijava")}
            >
              Prijavite se
            </MuiButton>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default Registracija;
