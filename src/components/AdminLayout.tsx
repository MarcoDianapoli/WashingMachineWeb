import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { LayoutDashboard, Wrench, Users, DollarSign, Package, Settings, LogOut, Calendar, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { setCliente } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setCliente(null);
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/citas', label: 'Citas', icon: <Calendar size={20} /> },
    { to: '/admin/lavadores', label: 'Lavadores', icon: <Wrench size={20} /> },
    { to: '/admin/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { to: '/admin/finanzas', label: 'Finanzas', icon: <DollarSign size={20} /> },
    { to: '/admin/inventario', label: 'Inventario', icon: <Package size={20} /> },
    { to: '/admin/configuraciones', label: 'Configuraciones', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-wrapper">
        <header className="admin-topbar">
          <div className="admin-brand">
            <img src="/assets/images/logo.png" alt="Logo" style={{ height: '32px', width: 'auto' }} />
            <h2 className="brand-text" style={{ fontFamily: 'sans-serif', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>ADMINISTRACIÓN</h2>
          </div>
          
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="admin-nav desktop-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-topbar-actions">
            <button onClick={handleLogout} className="admin-logout-btn" title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="mobile-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        <main className="admin-content">
          <div className="admin-page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
