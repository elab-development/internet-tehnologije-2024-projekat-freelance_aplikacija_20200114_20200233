import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Alert,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Divider
} from "@mui/material";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from "recharts";

const API_BASE = "http://127.0.0.1:8000/api";

export default function StatistikaPonudjac({ token }) {
  const [series, setSeries] = useState([]);
  const [byProject, setByProject] = useState([]);
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState("");

  // Filters
  const [groupBy, setGroupBy] = useState("day"); // day | month
  const [days, setDays] = useState(30);
  const [projectId, setProjectId] = useState("");

  const load = async () => {
    setErr("");
    try {
      const params = new URLSearchParams();
      if (groupBy) params.set("group_by", groupBy);
      if (days) params.set("days", days);
      if (projectId) params.set("project_id", projectId);

      const res = await fetch(`${API_BASE}/ponudjac/zahtevi/statistika?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Greška pri učitavanju statistike.");

      setSeries(json?.data?.series ?? []);
      setByProject(json?.data?.by_project ?? []);
      setMeta(json?.meta ?? null);
    } catch (e) {
      setErr(e.message || "Greška pri učitavanju statistike.");
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Statistika zahteva</Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Grupisanje</InputLabel>
          <Select label="Grupisanje" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="day">Po danu</MenuItem>
            <MenuItem value="month">Po mesecu</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          type="number"
          label="Poslednjih dana"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value || "0", 10))}
          sx={{ width: 160 }}
        />

        <Button variant="contained" onClick={load} sx={{ bgcolor: "#D42700", "&:hover": { bgcolor: "#b31e00" } }}>
          Primeni
        </Button>
      </Box>

      {meta && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Opseg: <b>{meta.date_from}</b> – <b>{meta.date_to}</b> •
          Ukupno: <b>{meta.total}</b> • Odobreno: <b>{meta.approved}</b> •
          Konverzija: <b>{meta.approval_rate}%</b>
          {meta.project_id ? <> • Projekat ID: <b>{meta.project_id}</b></> : null}
        </Alert>
      )}

      {/* LINE CHART: ukupno i odobren kroz vreme */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Kretanje zahteva kroz vreme</Typography>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ukupno" strokeWidth={2} name="Ukupno" />
              <Line type="monotone" dataKey="odobren" strokeWidth={2} name="Odobreni" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* STACKED BAR: status po bucket-u */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Status po periodima</Typography>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="obrada" stackId="a" name="Obrada" />
              <Bar dataKey="odobren" stackId="a" name="Odobren" />
              <Bar dataKey="odbijen" stackId="a" name="Odbijen" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* BAR: projekti po broju zahteva */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Top projekti po zahtevima</Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={byProject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ukupno" name="Ukupno" />
              <Bar dataKey="odobren" name="Odobreni" />
              <Bar dataKey="odbijen" name="Odbijeni" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
