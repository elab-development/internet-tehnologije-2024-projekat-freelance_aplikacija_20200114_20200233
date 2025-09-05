import { useEffect, useState } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip, Alert, Typography } from "@mui/material";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
  "http://127.0.0.1:8000/api";

export default function ProdavacZahtevi({ token }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    if (!token) {
      setErr("Nedostaje token (niste prijavljeni).");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/ponudjac/zahtevi`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) { // no content
        setRows([]);
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.message || "Greška pri učitavanju zahteva.");
      }

      // Accept either {data:[...]} or just [...]
      const data = Array.isArray(json) ? json : (json.data ?? []);
      setRows(data);
    } catch (e) {
      setErr(e.message || "Greška pri učitavanju zahteva.");
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

  const setStatus = async (id, status, projectId) => {
    setErr("");
    if (!token) {
      setErr("Nedostaje token (niste prijavljeni).");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/ponudjac/zahtevi/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.message || "Greška pri promeni statusa.");
      }

      // Optimistic local update
      setRows(prev => prev.map(r => {
        if (r.id === id) return { ...r, status };
        if (status === "odobren" && r.project_id === projectId && r.id !== id) {
          return { ...r, status: "odbijen" };
        }
        return r;
      }));

      // Ensure full sync (in case server did more, e.g., locked project, timestamps, etc.)
      if (status === "odobren") {
        load();
      }
    } catch (e) {
      setErr(e.message || "Greška pri promeni statusa.");
    }
  };

  // === ADD: Export PDF handler ===
  const exportPdf = async () => {
    setErr("");
    if (!token) { setErr("Nedostaje token (niste prijavljeni)."); return; }
    try {
      const res = await fetch(`${API_BASE}/ponudjac/zahtevi/export-pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = "Greška pri izvozu PDF-a.";
        try { msg = JSON.parse(text)?.error || JSON.parse(text)?.message || msg; } catch {}
        throw new Error(msg);
      }

      const blob = await res.blob(); // expected application/pdf
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zahtevi_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e.message || "Greška pri izvozu PDF-a.");
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

      {/* === ADD: Export button (keeps layout) === */}
      <Box sx={{ width: "100%", maxWidth: 1100, display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button
          variant="contained"
          onClick={exportPdf}
          sx={{ textTransform: "none", bgcolor: "#D42700", "&:hover": { bgcolor: "#b31e00" } }}
        >
          Export PDF
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Projekat</TableCell>
            <TableCell>Kupac</TableCell>
            <TableCell>Poruka</TableCell>
            <TableCell align="right">Budžet</TableCell>
            <TableCell align="right">Ponuda</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Akcije</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.project?.title}</TableCell>
              <TableCell>{r.service_buyer?.name || r.serviceBuyer?.name || r.buyer?.name}</TableCell>
              <TableCell>{r.message}</TableCell>
              <TableCell align="right">{Number(r.project?.budget ?? 0).toFixed(2)}</TableCell>
              <TableCell align="right">{Number(r.price_offer ?? 0).toFixed(2)}</TableCell>
              <TableCell>{chip(r.status)}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  disabled={r.status !== "obrada"}
                  onClick={() => setStatus(r.id, "odobren", r.project_id)}
                >
                  Odobri
                </Button>
                <Button
                  size="small"
                  color="error"
                  disabled={r.status !== "obrada"}
                  onClick={() => setStatus(r.id, "odbijen", r.project_id)}
                >
                  Odbij
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
