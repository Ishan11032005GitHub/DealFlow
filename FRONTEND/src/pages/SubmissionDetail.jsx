import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import StatusPill from "../components/StatusPill.jsx";
import {
  generateAiSummary,
  getSubmission,
  updateSubmission,
} from "../api/submissions.js";

export default function SubmissionDetail() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState("");

  const load = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await getSubmission(id);
      setItem(res);
      setNotes(res?.reviewerNotes || "");
    } catch (err) {
      setError(err.message || "Failed to load submission");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const createdLabel = useMemo(() => fmtDate(item?.createdAt), [item?.createdAt]);

  const setStatus = async (status) => {
    try {
      setSaving(true);
      setError("");
      const updated = await updateSubmission(id, { status });
      setItem(updated);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    try {
      setSaving(true);
      setError("");
      const updated = await updateSubmission(id, { reviewerNotes: notes });
      setItem(updated);
    } catch (err) {
      setError(err.message || "Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const runAi = async () => {
    try {
      setAiBusy(true);
      setError("");
      const updated = await generateAiSummary(id);
      const doc = updated?.submission || updated;
      setItem(doc);
    } catch (err) {
      setError(err.message || "Failed to generate AI summary");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <>
      <TopNav />
      <div className="container">
        <div className="page-head">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <h1>Submission detail</h1>
            <Link className="link" to="/admin">
              ← Back
            </Link>
          </div>
          <p className="muted">Review, update status, and add notes.</p>
        </div>

        {error && <div className="alert error">{error}</div>}
        {busy && <div className="alert info">Loading...</div>}

        {item && (
          <div className="gridDetail">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 style={{ margin: 0 }}>{item.startupName}</h2>
                  <div className="muted">
                    Founder: <span className="strong">{item.founderName}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusPill status={item.status} />
                  <div className="muted" style={{ marginTop: 8 }}>
                    {createdLabel}
                  </div>
                </div>
              </div>

              <div className="kv">
                <div>
                  <span className="k">Sector</span>
                  <span className="v">{item.sector}</span>
                </div>
                <div>
                  <span className="k">Stage</span>
                  <span className="v">{item.stage}</span>
                </div>
                <div>
                  <span className="k">Traction</span>
                  <span className="v">{item.traction}</span>
                </div>
              </div>

              <div className="section">
                <h3>Pitch</h3>
                <p className="pre">{item.pitchDescription}</p>
              </div>

              <div className="section">
                <h3>Status</h3>
                <div className="btn-row">
                  <button
                    className="btn secondary"
                    disabled={saving || item.status === "NEW"}
                    onClick={() => setStatus("NEW")}
                  >
                    Mark NEW
                  </button>
                  <button
                    className="btn secondary"
                    disabled={saving || item.status === "REVIEWED"}
                    onClick={() => setStatus("REVIEWED")}
                  >
                    Mark REVIEWED
                  </button>
                  <button
                    className="btn primary"
                    disabled={saving || item.status === "PASSED"}
                    onClick={() => setStatus("PASSED")}
                  >
                    Mark PASSED
                  </button>
                </div>
                {saving && <div className="muted" style={{ marginTop: 8 }}>Saving…</div>}
              </div>

              <div className="section">
                <h3>Reviewer notes</h3>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for internal context..."
                />
                <div className="btn-row">
                  <button
                    className="btn secondary"
                    disabled={saving}
                    onClick={() => setNotes(item.reviewerNotes || "")}
                  >
                    Reset
                  </button>
                  <button className="btn primary" disabled={saving} onClick={saveNotes}>
                    Save notes
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>AI summary</h3>
                <div className="muted">Optional (single API call)</div>
              </div>

              {item.aiSummary ? (
                <AiSummaryBlock summary={item.aiSummary} />
              ) : (
                <div className="muted">No AI summary generated yet.</div>
              )}

              <div style={{ marginTop: 14 }}>
                <button className="btn primary" disabled={aiBusy} onClick={runAi}>
                  {aiBusy ? "Generating..." : item.aiSummary ? "Regenerate" : "Generate summary"}
                </button>
                <div className="muted" style={{ marginTop: 8 }}>
                  Generates bullets + strengths + risks from the pitch description and stores it.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function AiSummaryBlock({ summary }) {
  const bullets = Array.isArray(summary?.bullets) ? summary.bullets : [];
  const strengths = Array.isArray(summary?.strengths) ? summary.strengths : [];
  const risks = Array.isArray(summary?.risks) ? summary.risks : [];

  return (
    <div className="ai">
      <MetaRow label="Model" value={summary?.model || "—"} />
      <MetaRow label="Generated" value={fmtDate(summary?.generatedAt)} />

      <div className="ai-section">
        <div className="ai-title">Summary</div>
        <ul>
          {bullets.map((x, i) => <li key={i}>{x}</li>)}
          {!bullets.length && <li className="muted">—</li>}
        </ul>
      </div>

      <div className="ai-section">
        <div className="ai-title">Strengths</div>
        <ul>
          {strengths.map((x, i) => <li key={i}>{x}</li>)}
          {!strengths.length && <li className="muted">—</li>}
        </ul>
      </div>

      <div className="ai-section">
        <div className="ai-title">Risks</div>
        <ul>
          {risks.map((x, i) => <li key={i}>{x}</li>)}
          {!risks.length && <li className="muted">—</li>}
        </ul>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="meta-row">
      <span className="k">{label}</span>
      <span className="v">{value || "—"}</span>
    </div>
  );
}

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
