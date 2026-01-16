import React from "react";
import StatusPill from "./StatusPill.jsx";

export default function SubmissionsTable({ items, onRowClick }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Submissions</h3>
        <div className="muted">{items.length} total</div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Founder</th>
              <th>Sector</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {items.map((s) => (
              <tr key={s.id} onClick={() => onRowClick(s)} className="row-click">
                <td className="strong">{s.startupName}</td>
                <td>{s.founderName}</td>
                <td>{s.sector}</td>
                <td>{s.stage}</td>
                <td><StatusPill status={s.status} /></td>
                <td>{formatDate(s.createdAt)}</td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">No results.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
