import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Usluge = ({ token }) => {
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;

  // Fetch all projects (used for filtering/sorting)
  useEffect(() => {
    const fetchAllProjects = async () => {
      setLoading(true);
      try {
        const results = [];
        let page = 1;
        let lastPage = 1;

        do {
          const res = await fetch(`http://127.0.0.1:8000/api/kupac/projekti?page=${page}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const json = await res.json();
          results.push(...json.data);
          lastPage = json.meta?.last_page || 1;
          page++;
        } while (page <= lastPage);

        setAllProjects(results);
      } catch (error) {
        console.error("Error fetching all projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();
  }, [token]);

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
        console.error("Fetch categories error:", err);
      }
    };

    fetchCategories();
  }, [token]);

  // Apply filters and sorting
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category && String(p.category.id) === String(selectedCategory)
      );
    }

    if (sortOrder === "cena-asc") {
      filtered.sort((a, b) => a.budget - b.budget);
    } else if (sortOrder === "cena-desc") {
      filtered.sort((a, b) => b.budget - a.budget);
    }

    return filtered;
  }, [allProjects, searchQuery, selectedCategory, sortOrder]);

  // Paginate filtered results
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredProjects.slice(start, start + perPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / perPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedCategory]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, marginLeft:"150px" }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
        Projekti
      </Typography>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          mb: 4,
        }}
      >
        <TextField
          label="Pretraga po imenu"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Kategorija</InputLabel>
          <Select
            label="Kategorija"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">Sve</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sortiraj po ceni</InputLabel>
          <Select
            label="Sortiraj po ceni"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="default">Podrazumevano</MenuItem>
            <MenuItem value="cena-asc">Rastuće</MenuItem>
            <MenuItem value="cena-desc">Opadajuće</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : paginatedProjects.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
          Nema rezultata za zadate uslove.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedProjects.map((project) => (
              <Grid item xs={12} sm={12} md={6} key={project.id}>
                <Card
                  sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {project.category ? project.category.name : "Bez kategorije"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Cena: {project.budget} €
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rok: {project.deadline}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {project.description.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/usluge/${project.id}`)}
                      sx={{ textTransform: "none", color: "#D42700" }}
                    >
                      Detalji
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 4,
              gap: 1,
            }}
          >
            <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
              <ArrowBackIosNewIcon sx={{ color: "#D42700" }} />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#333" }}>
              {currentPage} / {totalPages}
            </Typography>
            <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
              <ArrowForwardIosIcon sx={{ color: "#D42700" }} />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Usluge;
