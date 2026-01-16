import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, isAuthed } from "../api/auth.js";

export default function TopNav() {
  const nav = useNavigate();
  const loc = useLocation();
  const authed = isAuthed();

  const onLogout = () => {
    logout();
    nav("/admin/login", { replace: true });
  };

  return (
    <div className="topnav">
      <div className="topnav-inner container">
        <div className="brand">
          <Link to="/submit" className="brand-link">Startup Intake Tool</Link>
          <span className="tag">Internal MVP</span>
        </div>

        <div className="nav-actions">
          <Link className={`nav-link ${loc.pathname === "/submit" ? "active" : ""}`} to="/submit">
            Submit
          </Link>

          {authed ? (
            <>
              <Link className={`nav-link ${loc.pathname === "/admin" ? "active" : ""}`} to="/admin">
                Admin
              </Link>
              <button className="btn secondary" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <Link
              className={`nav-link ${loc.pathname === "/admin/login" ? "active" : ""}`}
              to="/admin/login"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
