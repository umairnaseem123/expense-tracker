import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, FileBarChart, LogOut, Menu, X, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

const titles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/reports": "Reports",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="app">
      {open && <div className="app-overlay" onClick={() => setOpen(false)} />}

      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="app-brand">
          <span className="app-brand-icon"><Wallet size={18} /></span>
          <span>FinTrack</span>
          <button className="app-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="app-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `app-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="app-link app-logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button className="app-menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <h1>{titles[pathname] || "FinTrack"}</h1>
          <div className="app-user">
            <span className="app-user-name">{user?.name}</span>
            <span className="app-avatar">{initial}</span>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
