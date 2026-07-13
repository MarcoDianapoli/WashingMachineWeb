import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { LayoutDashboard, Wrench, Users, DollarSign, Package, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { setCliente } = useApp();

  const handleLogout = () => {
    setCliente(null);
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/lavadores', label: 'Lavadores', icon: <Wrench size={20} /> },
    { to: '/admin/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { to: '/admin/finanzas', label: 'Finanzas', icon: <DollarSign size={20} /> },
    { to: '/admin/inventario', label: 'Inventario', icon: <Package size={20} /> },
    { to: '/admin/configuraciones', label: 'Configuraciones', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div className="admin-brand">
          <h2 className="brand-text">WashinMachine</h2>
          <span className="admin-badge">Admin</span>
        </div>
        
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-topbar-actions">
          <button onClick={handleLogout} className="admin-logout-btn" title="Cerrar Sesión">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
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
