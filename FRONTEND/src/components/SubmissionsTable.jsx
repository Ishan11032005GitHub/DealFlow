import StatusPill from "./StatusPill";

export default function SubmissionsTable({ items, onRowClick }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Startup</th><th>Founder</th><th>Sector</th>
          <th>Stage</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map(s => (
          <tr key={s.id} onClick={() => onRowClick(s)}>
            <td>{s.startup_name}</td>
            <td>{s.founder_name}</td>
            <td>{s.sector}</td>
            <td>{s.stage}</td>
            <td><StatusPill status={s.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
