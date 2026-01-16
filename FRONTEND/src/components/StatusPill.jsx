import React from "react";

export default function StatusPill({ status }) {
  const s = String(status || "NEW").toUpperCase();
  const cls =
    s === "PASSED" ? "pill passed" :
    s === "REVIEWED" ? "pill reviewed" :
    "pill new";

  return <span className={cls}>{s}</span>;
}
