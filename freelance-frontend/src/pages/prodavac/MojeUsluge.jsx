import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const MojeUsluge = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  // Form fields for new project
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category_id: "",
    priority: "srednji",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/categories", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Greška pri dohvaćanju kategorija", err);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch my projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ponudjac/projekti", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProjects(data.data || []);
    } catch (err) {
      console.error("Greška pri dohvaćanju usluga", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ponudjac/projekti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        fetchProjects(); // Refresh list
        handleCloseDialog();
        setFormData({
          title: "",
          description: "",
          budget: "",
          deadline: "",
          category_id: "",
          priority: "srednji",
        });
      } else {
        alert("Greška: " + (result.message || "Neuspešno kreiranje."));
      }
    } catch (err) {
      console.error("Greška pri slanju forme", err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, marginLeft: "130px" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
        Moje Usluge
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: "#D42700", textTransform: "none" }}
          onClick={handleOpenDialog}
        >
          Kreiraj novu uslugu
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Trenutno nemate nijednu uslugu.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={12} md={6} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{project.title}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {project.category?.name || "Bez kategorije"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Budžet: {project.budget} €
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Rok: {project.deadline}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Prioritet: {project.priority}
                  </Typography>
                  <Typography variant="body2">
                    {project.description.substring(0, 100)}...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog for creating new service */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Kreiraj novu uslugu</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Naziv"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Opis"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Budžet (€)"
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="date"
            label="Rok"
            name="deadline"
            InputLabelProps={{ shrink: true }}
            value={formData.deadline}
            onChange={handleChange}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategorija</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              label="Kategorija"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Prioritet</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Prioritet"
            >
              <MenuItem value="nizak">Nizak</MenuItem>
              <MenuItem value="srednji">Srednji</MenuItem>
              <MenuItem value="visok">Visok</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Otkaži</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "#D42700" }}>
            Kreiraj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MojeUsluge;
