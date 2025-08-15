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
  Rating,
} from "@mui/material";

const API = "http://127.0.0.1:8000/api";

function toNum(v) {
  // prihvati broj ili string, skini eventualne razmake/simbol €
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^\d.,-]/g, "").replace(",", "."));
  return NaN;
}

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

  // Licitation state
  const [reqs, setReqs] = useState([]);
  const [highestBid, setHighestBid] = useState(null);
  const [highestBidder, setHighestBidder] = useState("");
  const [requestsCount, setRequestsCount] = useState(0);
  const [hasApproved, setHasApproved] = useState(false);

  // Reviews
  const [avgRating, setAvgRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [revOpen, setRevOpen] = useState(false);

  // ---- helpers ---------------------------------------------------------------
  const computeStatsFromList = (list, lock = false) => {
    if (!Array.isArray(list) || list.length === 0) {
      setRequestsCount(0);
      setHighestBid(null);
      setHighestBidder("");
      setHasApproved(Boolean(lock));
      return;
    }

    const normalized = list.map((r) => ({
      ...r,
      price_offer: toNum(r?.price_offer),
    }));

    setRequestsCount(normalized.length);

    // approved?
    const approvedExists = normalized.some((r) => r?.status === "odobren");
    setHasApproved(approvedExists || Boolean(lock));

    // highest bid
    const maxReq = normalized.reduce((acc, cur) =>
      (acc?.price_offer ?? -Infinity) < (cur?.price_offer ?? -Infinity) ? cur : acc
    );

    const bidderName =
      maxReq?.service_buyer?.name ||
      maxReq?.serviceBuyer?.name ||
      maxReq?.buyer?.name ||
      maxReq?.user?.name ||
      "Nepoznat kupac";

    setHighestBid(Number(maxReq?.price_offer ?? 0));
    setHighestBidder(bidderName);
  };

  // ---- API load --------------------------------------------------------------
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/kupac/projekti/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Greška pri učitavanju projekta (${res.status}).`);
      }
      const data = await res.json();
      const proj = data.data || data;
      setProject(proj);

      // ako backend vraća proj.requests – koristi ih; inače pokupi preko rute
      if (Array.isArray(proj.requests) && proj.requests.length) {
        setReqs(proj.requests);
        computeStatsFromList(proj.requests, proj?.is_locked);
      } else {
        await fetchLicitacija(proj?.is_locked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLicitacija = async (lockFlag = false) => {
    try {
      const r = await fetch(`${API}/kupac/projekti/${id}/requests`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (r.status === 204) {
        setReqs([]);
        computeStatsFromList([], lockFlag);
        return;
      }
      if (!r.ok) throw new Error(`Greška pri učitavanju zahteva (${r.status}).`);

      const json = await r.json().catch(() => ({}));
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      setReqs(list);
      computeStatsFromList(list, lockFlag);
    } catch (e) {
      console.warn("Licitacija load skipped:", e?.message || e);
    }
  };

  const fetchReviews = async () => {
    try {
      const r = await fetch(`${API}/kupac/projekti/${id}/reviews`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (r.status === 204) {
        setReviews([]);
        setAvgRating(0);
        return;
      }
      if (!r.ok) return;
      const json = await r.json().catch(() => ({}));
      const list = Array.isArray(json?.data) ? json.data : [];
      setReviews(list);
      setAvgRating(Number(json?.meta?.avg_rating ?? 0));
    } catch (e) {
      console.warn("Reviews load skipped:", e?.message || e);
    }
  };

  useEffect(() => {
    setReqs([]);
    setHasApproved(false);
    setRequestsCount(0);
    setHighestBid(null);
    setHighestBidder("");
    (async () => {
      await fetchProjectDetails();
      await fetchReviews();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- create offer ----------------------------------------------------------
  const handleOpen = () => {
    const b = toNum(project?.budget ?? 0);
    setMessage("");
    setPrice(Number.isFinite(highestBid) ? Math.max(b, highestBid) : b);
    setErr("");
    setOk("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    setErr("");
    setOk("");

    const budget = toNum(project?.budget ?? 0);
    const offer = toNum(price);

    if (!Number.isFinite(offer) || offer < budget) {
      setErr(`Ponuda mora biti broj i ≥ budžet (${budget}).`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API}/kupac/zahtevi/${project.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, price_offer: offer }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Greška pri slanju zahteva.");

      setOk("Zahtev je uspešno poslat.");
      setOpen(false);

      // optimistički dodaj novi zahtev u lokalnu listu da baner odmah proradi
      const created = data?.data || data || {};
      const normalized = {
        id: created.id,
        price_offer: toNum(created.price_offer ?? offer),
        status: created.status || "obrada",
        service_buyer: { id: created.service_buyer_id, name: sessionStorage.getItem("userName") },
      };
      setReqs((prev) => {
        const next = [normalized, ...prev];
        computeStatsFromList(next, project?.is_locked);
        return next;
      });

      // potvrdi stanje sa servera
      await fetchLicitacija(project?.is_locked);
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

          {/* prosečna ocena */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating value={avgRating || 0} precision={0.1} readOnly />
            <Typography variant="body2">({(avgRating || 0).toFixed(1)})</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setRevOpen(true)}
              sx={{ ml: 1, textTransform: "none" }}
            >
              Pogledaj sve recenzije
            </Button>
          </Box>

          {/* licitacioni baner */}
          {requestsCount >= 1 && Number.isFinite(highestBid) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Licitacija: Trenutno najviša ponuda je{" "}
              <b>{highestBid.toFixed(2)} €</b> (kupac: <b>{highestBidder}</b>). Ukupno zahteva:{" "}
              {requestsCount}.
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            {project.description}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Cena: {toNum(project.budget)} €
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

        {/* dugmad */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2 }}>
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

      {/* modal: novi zahtev */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Napravi zahtev</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Budžet projekta: <b>{toNum(project?.budget ?? 0)}</b> €
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
            value={Number.isFinite(price) ? price : ""}
            onChange={(e) => setPrice(Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : toNum(e.target.value))}
            fullWidth
            inputProps={{ min: toNum(project?.budget ?? 0), step: "0.01" }}
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
            sx={{ bgcolor: "#D42700", "&:hover": { bgcolor: "#b31e00" } }}
          >
            {submitting ? "Slanje..." : "Pošalji"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* modal: sve recenzije */}
      <Dialog open={revOpen} onClose={() => setRevOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Recenzije</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 420, overflow: "auto" }}>
          {reviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Još nema recenzija.
            </Typography>
          ) : (
            reviews.map((rv) => (
              <Box key={rv.id} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating value={toNum(rv.rating) || 0} readOnly />
                  <Typography variant="caption" color="text.secondary">
                    {rv.buyer?.name ? `by ${rv.buyer.name}` : ""} • {rv.created_at}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {rv.review}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevOpen(false)}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetaljiUsluge;
