import { useEffect, useState } from "react";
import {
  Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Box
} from "@mui/material";

const API_BASE = "http://127.0.0.1:8000/api";

export default function KupacZahtevi({ token }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  // Delete confirm
  const [delOpen, setDelOpen] = useState(false);
  const [delId, setDelId] = useState(null);

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

  const openEdit = (row) => {
    setEditId(row.id);
    setEditMessage(row.message || "");
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  const saveEdit = async () => {
    setErr(""); setOk("");
    try {
      const res = await fetch(`${API_BASE}/kupac/zahtevi/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: editMessage })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || json?.message || "Greška pri čuvanju izmene.");

      setOk("Poruka je ažurirana.");
      setEditOpen(false);
      // Update row locally
      setRows(prev => prev.map(r => r.id === editId ? { ...r, message: editMessage } : r));
    } catch (e) {
      setErr(e.message || "Greška pri čuvanju izmene.");
    }
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
      setOk("Zahtev je obrisan.");
      setDelOpen(false);
      setRows(prev => prev.filter(r => r.id !== delId));
    } catch (e) {
      setErr(e.message || "Greška pri brisanju zahteva.");
    }
  };

  const chip = (s) => (
    <Chip
      size="small"
      label={s}
      color={s === "odobren" ? "success" : s === "odbijen" ? "error" : "default"}
    />
  );

  return (
    <Box
      component="section"
      sx={{
        minHeight: "calc(40vh - 120px)", // adjust according to your NavMenu/Footer heights
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
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => openEdit(r)}
                    disabled={r.status !== "obrada"} // only editable while in progress
                  >
                    Izmeni
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => openDelete(r.id)}
                    disabled={r.status === "odobren"} // don't allow deleting approved
                  >
                    Obriši
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit message dialog */}
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
          <Button
            variant="contained"
            onClick={saveEdit}
            sx={{ bgcolor: "#D42700", "&:hover": { bgcolor: "#b31e00" } }}
          >
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={delOpen} onClose={closeDelete} fullWidth maxWidth="xs">
        <DialogTitle>Obriši zahtev?</DialogTitle>
        <DialogContent>
          <Typography>Da li ste sigurni da želite da obrišete ovaj zahtev?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Otkaži</Button>
          <Button
            variant="contained"
            color="error"
            onClick={doDelete}
          >
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
