import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';
import iconLogo from '../assets/gc-icon.png';
import {
  IconClose,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconPlus,
  IconShield,
  IconTicket,
} from './Icons';

// Page titles shown in the top bar
const titles = [
  ['/dashboard', 'Dashboard'],
  ['/tickets/new', 'Create Ticket'],
  ['/tickets/', 'Ticket Details'],
  ['/tickets', 'My Tickets'],
  ['/admin', 'Admin Dashboard'],
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the page changes
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const pageTitle =
    titles.find(([path]) => location.pathname.startsWith(path))?.[1] || 'SupportDesk';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { to: '/tickets', label: 'My Tickets', icon: <IconTicket />, end: true },
    { to: '/tickets/new', label: 'Create Ticket', icon: <IconPlus /> },
  ];
  if (isAdmin) links.push({ to: '/admin', label: 'Admin Dashboard', icon: <IconShield /> });

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <img src={iconLogo} alt="GodzillaCoder logo" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-team">GodzillaCoder</span>
            <span className="brand-product">SupportDesk</span>
          </div>
          <button
            type="button"
            className="icon-btn sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>

        <nav className="nav">
          <span className="nav-heading">Menu</span>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{initials(user?.name)}</span>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{isAdmin ? 'Administrator' : 'User'}</span>
            </div>
          </div>
          <button type="button" className="nav-link logout" onClick={handleLogout}>
            <IconLogout />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <h1 className="topbar-title">{pageTitle}</h1>
          <div className="topbar-right">
            <span className="topbar-greeting">
              Hi, <strong>{user?.name?.split(' ')[0]}</strong>
            </span>
            <span className="avatar avatar-sm">{initials(user?.name)}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="app-footer">
          GodzillaCoder SupportDesk &middot; COMP229 Web Application Development &middot; Centennial College
        </footer>
      </div>
    </div>
  );
}
