import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/hooks";
import { logout } from "../../redux/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";

const nav = [
  { to: "/locales", label: "Locales" },
  { to: "/countries", label: "Countries" },
  { to: "/teams", label: "Teams" },
  { to: "/athletes", label: "Athletes" },
  { to: "/positions", label: "Positions" },
  { to: "/templates", label: "Templates" },
  { to: "/change-password", label: "Change Password" },
];

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Soccer Quiz Admin</h1>
        <p>Operator: {username ?? "admin"}</p>
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          className="ghost"
          onClick={() => {
            dispatch(logout());
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
