import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { setCliente, cliente } = useApp();
  const [nombre, setNombre] = useState(cliente?.nombre ?? '');
  const [telefono, setTelefono] = useState(cliente?.telefono ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;
    setCliente({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      vehiculo: { placa: '', marca: '', modelo: '', color: '' },
      personaRecoge: '',
      direccion: '',
      notas: '',
    });
    navigate('/mis-citas');
  };

  return (
    <div className="page" style={{ maxWidth: 500 }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Registrarse</h1>
      <p style={{ textAlign: 'center', color: 'var(--gray)', marginBottom: 32 }}>
        Ingresa tus datos para comenzar a agendar citas
      </p>
      <form onSubmit={handleSubmit} style={{ background: 'var(--white)', padding: 24, borderRadius: 12 }}>
        <div className="input-group">
          <label className="input-label">Nombre completo</label>
          <input
            className="input-field"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label">Número de contacto</label>
          <input
            className="input-field"
            placeholder="Teléfono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8 }}
          disabled={!nombre.trim() || !telefono.trim()}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
