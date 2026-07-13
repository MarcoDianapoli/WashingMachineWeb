import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../store';

export default function Navbar() {
  const { pathname } = useLocation();
  const { cliente } = useApp();
  const loggedIn = !!cliente;

  const isActive = (path: string) => pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand"><img src="/assets/images/logo.png" alt="Monkey Auto Spa" className="navbar-logo" /> Monkey Auto Spa</Link>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Inicio</Link>
        {loggedIn ? (
          <>
            <Link to="/mis-citas" className={isActive('/mis-citas')}>Mis Citas</Link>
            <Link to="/paquetes" className={isActive('/paquetes')}>Paquetes</Link>
            <Link to="/perfil" className={isActive('/perfil')}>Perfil</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Iniciar Sesión</Link>
            <Link to="/login" className="navbar-btn">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
