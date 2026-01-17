import { Link, useNavigate } from "react-router-dom";
import { isAuthed, logout } from "../api/auth";

export default function TopNav() {
  const nav = useNavigate();
  const authed = isAuthed();

  const onLogout = () => {
    logout();
    nav("/admin/login", { replace: true });
  };

  return (
    <header className="topnav">
      <div className="topnav-inner container">
        <div className="brand">
          <Link to="/submit" className="brand-link">
            DealFlow
          </Link>
          <span className="tag">Internal MVP</span>
        </div>

        <nav className="nav-actions">
          <Link className="nav-link" to="/submit">Submit</Link>

          {authed ? (
            <>
              <Link className="nav-link" to="/admin">Admin</Link>
              <button className="btn secondary" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="nav-link" to="/admin/login">
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
