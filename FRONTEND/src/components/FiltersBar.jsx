import React from "react";
import { SECTORS, STAGES, STATUSES } from "../api/submissions.js";

export default function FiltersBar({
  sector, setSector,
  stage, setStage,
  status, setStatus,
  q, setQ,
  onClear,
}) {
  return (
    <div className="filters">
      <div className="field">
        <label>Sector</label>
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">All</option>
          {SECTORS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Stage</label>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All</option>
          {STAGES.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>

      <div className="field grow">
        <label>Search</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Founder or startup name..."
        />
      </div>

      <div className="field actions">
        <label>&nbsp;</label>
        <button className="btn secondary" type="button" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
