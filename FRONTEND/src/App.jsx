import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Submit from "./pages/Submit.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SubmissionDetail from "./pages/SubmissionDetail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/submit" replace />} />

      <Route path="/submit" element={<Submit />} />

      {/* Admin auth route */}
      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/submissions/:id"
        element={
          <ProtectedRoute>
            <SubmissionDetail />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/submit" replace />} />
    </Routes>
  );
}
