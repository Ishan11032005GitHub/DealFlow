import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed } from "../api/auth.js";

export default function ProtectedRoute({ children }) {
  const loc = useLocation();

  if (!isAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  }

  return children;
}
