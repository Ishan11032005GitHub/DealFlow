import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import { login } from "../api/auth.js";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Enter username and password.");
      return;
    }

    try {
      setBusy(true);
      await login(username.trim(), password);
      nav(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopNav />
      <div className="container">
        <div className="page-head">
          <h1>Admin login</h1>
          <p className="muted">Basic auth for internal reviewers.</p>
        </div>

        <form className="card form narrow" onSubmit={onSubmit}>
          {error && <div className="alert error">{error}</div>}

          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn primary" disabled={busy} type="submit">
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
