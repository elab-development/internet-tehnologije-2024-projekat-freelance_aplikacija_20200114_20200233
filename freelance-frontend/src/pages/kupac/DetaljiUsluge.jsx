import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";

const DetaljiUsluge = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/kupac/projekti/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setProject(data.data || data);
      } else {
        const text = await res.text();
        console.error("Project details response is not JSON:", text);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !project) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Card sx={{ maxWidth: 800, mx: "auto", p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {project.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {project.category ? project.category.name : "Bez kategorije"}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {project.description}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Cena: {project.budget} €
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Rok: {project.deadline}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Prioritet: {project.priority}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Kreirano: {project.created_at}
          </Typography>
        </CardContent>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ textTransform: "none", color: "#D42700", borderColor: "#D42700" }}
          >
            Nazad
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default DetaljiUsluge;
