import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";

const DetaljiUsluge = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Licitation banner state
  const [highestBid, setHighestBid] = useState(null);
  const [highestBidder, setHighestBidder] = useState("");
  const [requestsCount, setRequestsCount] = useState(0);

  // Disable button if any request is approved or project is locked
  const [hasApproved, setHasApproved] = useState(false);

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
        const proj = data.data || data;
        setProject(proj);

        // If project already carries requests, compute from there; otherwise load via dedicated route
        if (Array.isArray(proj.requests) && proj.requests.length) {
          computeStatsFromList(proj.requests);
        } else {
          await fetchLicitacija(); // will set highest/approved if route exists
        }

        // Respect project.is_locked if backend exposes it
        if (proj?.is_locked) setHasApproved(true);
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

  // Load all requests for this project (licitations)
  const fetchLicitacija = async () => {
    try {
      const r = await fetch(`http://127.0.0.1:8000/api/kupac/projekti/${id}/requests`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!r.ok) return; // If route not available yet, skip silently
      const json = await r.json().catch(() => ({}));
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      if (list.length) computeStatsFromList(list);
    } catch (e) {
      console.warn("Licitacija load skipped:", e?.message || e);
    }
  };

  // Compute highest bid, bidder, total count, and whether there's an approved request
  const computeStatsFromList = (list) => {
    if (!Array.isArray(list) || !list.length) return;

    setRequestsCount(list.length);

    // If any is approved, disable button
    const approvedExists = list.some((r) => r?.status === "odobren");
    if (approvedExists) setHasApproved(true);

    // Highest bid
    const maxReq = list.reduce((acc, cur) => {
      const a = Number(acc?.price_offer ?? -Infinity);
      const b = Number(cur?.price_offer ?? -Infinity);
      return b > a ? cur : acc;
    }, null);

    const bidderName =
      maxReq?.service_buyer?.name ||
      maxReq?.serviceBuyer?.name ||
      maxReq?.buyer?.name ||
      maxReq?.user?.name ||
      "Nepoznat kupac";

    setHighestBid(Number(maxReq?.price_offer ?? 0));
    setHighestBidder(bidderName);
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpen = () => {
    setMessage("");
    setPrice(Number(project?.budget ?? 0));
    setErr("");
    setOk("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    setErr("");
    setOk("");

    const budget = Number(project?.budget ?? 0);
    const offer = Number(price);

    if (Number.isNaN(offer) || offer < budget) {
      setErr(`Ponuda (price offer) mora biti ≥ budžet (${budget}).`);
      return;
    }

    try {
      setSubmitting(true);
      // NOTE: using kupac namespace as per your recent code
      const res = await fetch(`http://127.0.0.1:8000/api/kupac/zahtevi/${project.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          price_offer: offer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Greška pri slanju zahteva.");
      }
      setOk("Zahtev je uspešno poslat.");

      // Refresh licitation stats after submit
      await fetchLicitacija();
    } catch (e) {
      setErr(e.message || "Greška pri slanju zahteva.");
    } finally {
      setSubmitting(false);
    }
  };

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

          {/* Licitation banner (shown only when there are 2+ requests) */}
          {requestsCount > 1 && highestBid != null && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Licitacija: Trenutno najviša ponuda je <b>{highestBid.toFixed(2)} €</b> (kupac: <b>{highestBidder}</b>). Ukupno zahteva: {requestsCount}.
            </Alert>
          )}

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

        {/* Buttons row — same layout; button disabled if approved exists or project locked */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2 }}>
          {/* Disable if approved exists or project is locked */}
          <Button
            variant="contained"
            onClick={handleOpen}
            disabled={Boolean(project?.is_locked) || hasApproved}
            sx={{
              textTransform: "none",
              bgcolor: "#D42700",
              "&:hover": { bgcolor: "#b31e00" },
            }}
          >
            Napravi Zahtev
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ textTransform: "none", color: "#D42700", borderColor: "#D42700" }}
          >
            Nazad
          </Button>
        </Box>
      </Card>

      {/* Modal dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Napravi zahtev</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Budžet projekta: <b>{Number(project?.budget ?? 0)}</b> €
          </Typography>

          <TextField
            label="Vaša poruka"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
          />

          <TextField
            label="Vaša ponuda (price offer) €"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            inputProps={{ min: Number(project?.budget ?? 0), step: "0.01" }}
            sx={{ mt: 2 }}
          />

          {err && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {err}
            </Alert>
          )}
          {ok && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {ok}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Otkaži</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: "#D42700",
              "&:hover": { bgcolor: "#b31e00" },
            }}
          >
            {submitting ? "Slanje..." : "Pošalji"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetaljiUsluge;
