import { useEffect, useState } from "react";
import {
  Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Box, Rating
} from "@mui/material";

const API_BASE = "http://127.0.0.1:8000/api";

export default function KupacZahtevi({ token }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Edit request dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  // Delete request dialog
  const [delOpen, setDelOpen] = useState(false);
  const [delId, setDelId] = useState(null);

  // Review dialog (create / edit)
  const [revOpen, setRevOpen] = useState(false);
  const [revMode, setRevMode] = useState("create"); // create | edit
  const [revRequestId, setRevRequestId] = useState(null);
  const [revId, setRevId] = useState(null);
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState("");

  const load = async () => {
    setErr(""); setOk("");
    try {
      const res = await fetch(`${API_BASE}/kupac/zahtevi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 204) { setRows([]); return; }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || json?.message || "Greška pri učitavanju zahteva.");
      const data = Array.isArray(json) ? json : (json.data ?? []);
      setRows(data);
    } catch (e) {
      setErr(e.message || "Greška pri učitavanju zahteva.");
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  // ===== Request edit/delete =====
  const openEdit = (row) => { setEditId(row.id); setEditMessage(row.message || ""); setEditOpen(true); };
  const closeEdit = () => setEditOpen(false);

  const saveEdit = async () => {
    setErr(""); setOk("");
    try {
      const res = await fetch(`${API_BASE}/kupac/zahtevi/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: editMessage })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || json?.message || "Greška pri čuvanju izmene.");
      setOk("Poruka je ažurirana."); setEditOpen(false);
      setRows(prev => prev.map(r => r.id === editId ? { ...r, message: editMessage } : r));
    } catch (e) { setErr(e.message || "Greška pri čuvanju izmene."); }
  };

  const openDelete = (id) => { setDelId(id); setDelOpen(true); };
  const closeDelete = () => setDelOpen(false);

  const doDelete = async () => {
    setErr(""); setOk("");
    try {
      const res = await fetch(`${API_BASE}/kupac/zahtevi/${delId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || json?.message || "Greška pri brisanju zahteva.");
      setOk("Zahtev je obrisan."); setDelOpen(false);
      setRows(prev => prev.filter(r => r.id !== delId));
    } catch (e) { setErr(e.message || "Greška pri brisanju zahteva."); }
  };

  // ===== Reviews (create/edit/delete) =====
  const openReviewCreate = (row) => {
    setRevMode("create");
    setRevRequestId(row.id);
    setRevId(null);
    setRevRating(5);
    setRevText("");
    setRevOpen(true);
  };
  const openReviewEdit = (row) => {
    setRevMode("edit");
    setRevRequestId(row.id);
    setRevId(row.review?.id);
    setRevRating(row.review?.rating ?? 5);
    setRevText(row.review?.review ?? "");
    setRevOpen(true);
  };
  const closeReview = () => setRevOpen(false);

  const saveReview = async () => {
    setErr(""); setOk("");
    try {
      let res;
      if (revMode === "create") {
        res = await fetch(`${API_BASE}/kupac/recenzije/${revRequestId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rating: Math.round(revRating), review: revText })
        });
      } else {
        res = await fetch(`${API_BASE}/kupac/recenzije/${revId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rating: Math.round(revRating), review: revText })
        });
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || json?.message || "Greška pri čuvanju recenzije.");

      setOk(revMode === "create" ? "Recenzija je kreirana." : "Recenzija je ažurirana.");
      setRevOpen(false);

      // Update row locally
      setRows(prev => prev.map(r => {
        if (r.id !== revRequestId) return r;
        const payload = json?.review?.data || json?.review || null;
        return {
          ...r,
          review: payload ? {
            id: payload.id ?? (revId || 0),
            rating: payload.rating ?? Math.round(revRating),
            review: payload.review ?? revText,
            created_at: payload.created_at || r.review?.created_at
          } : r.review
        };
      }));
    } catch (e) {
      setErr(e.message || "Greška pri čuvanju recenzije.");
    }
  };

  const deleteReview = async (row) => {
    setErr(""); setOk("");
    try {
      const res = await fetch(`${API_BASE}/kupac/recenzije/${row.review.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || json?.message || "Greška pri brisanju recenzije.");
      setOk("Recenzija je obrisana.");
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, review: null } : r));
    } catch (e) {
      setErr(e.message || "Greška pri brisanju recenzije.");
    }
  };

  const chip = (s) => (
    <Chip size="small" label={s} color={s === "odobren" ? "success" : s === "odbijen" ? "error" : "default"} />
  );

  return (
    <Box
      component="section"
      sx={{
        minHeight: "calc(40vh - 120px)",
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
      <Typography variant="h5" sx={{ mb: 2 }}>Moji Zahtevi</Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Projekat</TableCell>
            <TableCell>Poruka</TableCell>
            <TableCell align="right">Ponuda (€)</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Budžet (€)</TableCell>
            <TableCell>Kreirano</TableCell>
            <TableCell>Recenzija</TableCell>
            <TableCell>Akcije</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.project?.title || "-"}</TableCell>
              <TableCell>{r.message}</TableCell>
              <TableCell align="right">{Number(r.price_offer ?? 0).toFixed(2)}</TableCell>
              <TableCell>{chip(r.status)}</TableCell>
              <TableCell align="right">{Number(r.project?.budget ?? 0).toFixed(2)}</TableCell>
              <TableCell>{r.created_at}</TableCell>
              <TableCell>
                {r.status === "odobren" ? (
                  r.review ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating value={Number(r.review.rating) || 0} readOnly />
                      <Typography variant="body2">{r.review.review}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">— nema —</Typography>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => openEdit(r)}
                    disabled={r.status !== "obrada"}
                  >
                    Izmeni
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => openDelete(r.id)}
                    disabled={r.status === "odobren"}
                  >
                    Obriši
                  </Button>

                  {/* Review actions */}
                  {r.status === "odobren" && (
                    r.review ? (
                      <>
                        <Button size="small" onClick={() => openReviewEdit(r)}>Izmeni recenziju</Button>
                        <Button size="small" color="error" onClick={() => deleteReview(r)}>Obriši recenziju</Button>
                      </>
                    ) : (
                      <Button size="small" onClick={() => openReviewCreate(r)}>Ostavi recenziju</Button>
                    )
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit request dialog */}
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Izmena poruke</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Poruka"
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Otkaži</Button>
          <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: "#D42700", "&:hover": { bgcolor: "#b31e00" } }}>
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete request dialog */}
      <Dialog open={delOpen} onClose={closeDelete} fullWidth maxWidth="xs">
        <DialogTitle>Obriši zahtev?</DialogTitle>
        <DialogContent>
          <Typography>Da li ste sigurni da želite da obrišete ovaj zahtev?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Otkaži</Button>
          <Button variant="contained" color="error" onClick={doDelete}>Obriši</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit review dialog */}
      <Dialog open={revOpen} onClose={closeReview} fullWidth maxWidth="sm">
        <DialogTitle>{revMode === "create" ? "Nova recenzija" : "Izmena recenzije"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Rating value={Number(revRating)} onChange={(_, v) => setRevRating(v || 1)} />
            <Typography>{Math.round(revRating)}</Typography>
          </Box>
          <TextField
            label="Vaš utisak"
            value={revText}
            onChange={(e) => setRevText(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReview}>Otkaži</Button>
          <Button variant="contained" onClick={saveReview} sx={{ bgcolor: "#D42700", "&:hover": { bgcolor: "#b31e00" } }}>
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
