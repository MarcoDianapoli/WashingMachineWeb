import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function WasherLayout() {
  const navigate = useNavigate();
  const { authUser, setAuthSession } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setAuthSession(null);
    navigate('/login');
  };

  const navItems = [
    { to: '/lavador/dashboard', label: 'Mis Tareas', icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div className="admin-brand">
          <h2 className="brand-text">WashinMachine</h2>
          <span className="admin-badge" style={{ backgroundColor: '#2563eb' }}>Trabajador</span>
        </div>

        <nav className={`admin-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-topbar-actions">
          <span style={{ color: '#94a3b8', marginRight: '16px', fontSize: '0.9rem' }} className="hide-mobile">
            {authUser?.name}
          </span>
          <button onClick={handleLogout} className="admin-logout-btn" title="Cerrar Sesión">
            <LogOut size={20} />
            <span className="hide-mobile">Salir</span>
          </button>
        </div>
      </header>
      <main className="admin-content">
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
