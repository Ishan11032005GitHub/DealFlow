import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import SubmissionsTable from "../components/SubmissionsTable.jsx";
import { listSubmissions } from "../api/submissions.js";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  // debounce search
  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const filters = useMemo(() => {
    return {
      sector,
      stage,
      status,
      q: qDebounced,
      sort: "-createdAt",
      limit: 100,
    };
  }, [sector, stage, status, qDebounced]);

  const load = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await listSubmissions(filters);
      // support both {items: []} or raw array
      const list = Array.isArray(res) ? res : res?.items || res?.data || [];
      setItems(list);
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const onClear = () => {
    setSector("");
    setStage("");
    setStatus("");
    setQ("");
  };

  return (
    <>
      <TopNav />
      <div className="container">
        <div className="page-head">
          <h1>Admin dashboard</h1>
          <p className="muted">Review and track incoming startup submissions.</p>
        </div>

        <FiltersBar
          sector={sector}
          setSector={setSector}
          stage={stage}
          setStage={setStage}
          status={status}
          setStatus={setStatus}
          q={q}
          setQ={setQ}
          onClear={onClear}
        />

        {error && <div className="alert error">{error}</div>}
        {busy && <div className="alert info">Loading...</div>}

        <SubmissionsTable
          items={items}
          onRowClick={(s) => nav(`/admin/submissions/${s._id}`)}
        />
      </div>
    </>
  );
}
