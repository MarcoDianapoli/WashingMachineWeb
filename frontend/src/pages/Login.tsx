import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useApp } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { setAuthSession } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email.trim().toLowerCase(), password);

      if (res.user.role !== 'admin') {
        // Revoke the session right away — this panel is admin-only
        api.logout(res.token).catch(() => {});
        setError('Este panel es exclusivo para administradores. Lavadores y clientes usan la aplicación móvil.');
        return;
      }

      setAuthSession({ token: res.token, user: res.user });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 500, width: '100%', margin: '0 auto' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Acceso al Personal</h1>
      <p style={{ textAlign: 'center', color: 'var(--gray)', marginBottom: 32 }}>
        Inicia sesión para acceder al panel de administración.
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--white)', padding: 24, borderRadius: 12, marginBottom: 24 }}>
        <div className="input-group">
          <label className="input-label">Correo electrónico</label>
          <input
            className="input-field"
            type="email"
            placeholder="micorreo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label">Contraseña</label>
          <input
            className="input-field"
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8 }}
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? 'Entrando...' : 'Entrar al Panel'}
        </button>
      </form>

      <div style={{ background: 'var(--light-bg)', padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: 16 }}>¿Buscabas agendar un lavado?</h3>
        <p style={{ color: 'var(--gray)', marginBottom: 16 }}>
          Este panel es exclusivo para el personal. Los clientes pueden reservar citas desde nuestra aplicación móvil.
        </p>
        <a
          href="https://washin-machine.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ display: 'inline-block', textDecoration: 'none', width: '100%' }}
        >
          ¿Eres cliente? Clic aquí
        </a>
      </div>
    </div>
  );
}
