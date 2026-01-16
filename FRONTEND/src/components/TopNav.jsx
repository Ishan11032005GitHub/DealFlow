import { Link, useNavigate } from "react-router-dom";
import { isAuthed, logout } from "../api/auth";

export default function TopNav() {
  const nav = useNavigate();
  const authed = isAuthed();

  return (
    <div className="topnav">
      <Link to="/submit">DealFlow <span>Internal MVP</span></Link>
      <div>
        <Link to="/submit">Submit</Link>
        {authed ? (
          <>
            <Link to="/admin">Admin</Link>
            <button onClick={() => { logout(); nav("/admin/login"); }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/admin/login">Admin Login</Link>
        )}
      </div>
    </div>
  );
}
