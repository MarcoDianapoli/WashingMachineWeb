import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import type { Cita } from '../types';

export default function ConfirmarCita() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { paquetes, cliente, agregarCita } = useApp();

  const paqueteId = searchParams.get('paqueteId');
  const fecha = searchParams.get('fecha');
  const hora = searchParams.get('hora');
  const paquete = paquetes.find((p) => p.id === paqueteId);

  const confirmar = () => {
    if (!cliente || !paquete || !fecha || !hora) return;

    const nueva: Cita = {
      id: `cita-${Date.now()}`,
      paqueteId: paquete.id,
      paqueteNombre: paquete.nombre,
      fecha,
      hora,
      cliente,
      estado: 'pendiente',
    };
    agregarCita(nueva);
    navigate('/exito');
  };

  if (!cliente) {
    return (
      <div className="page">
        <h1 className="page-title">Confirmar cita</h1>
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
          <p style={{ color: '#92400e', fontWeight: 500 }}>
            Configura tus datos en Perfil antes de agendar.
          </p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/perfil')}>
          Ir a Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Confirmar cita</h1>

      <div className="card">
        <div className="card-label">Paquete seleccionado</div>
        <div className="card-title">{paquete?.nombre}</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--red)', marginBottom: 4 }}>{paquete?.precio}</div>
        <div style={{ fontSize: 14, color: '#666' }}>Duración: {paquete?.duracion}</div>
      </div>

      <div className="card">
        <div className="card-label">Fecha y hora</div>
        <div className="card-value">{fecha}</div>
        <div className="card-value">{hora}</div>
      </div>

      <div className="card">
        <div className="card-label">Cliente</div>
        <div className="card-value">{cliente.nombre}</div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Teléfono</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{cliente.telefono}</div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Vehículo</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
          {cliente.vehiculo.marca} {cliente.vehiculo.modelo}
        </div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Placa</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{cliente.vehiculo.placa || 'Sin registrar'}</div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Color</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{cliente.vehiculo.color || 'Sin registrar'}</div>
        {cliente.personaRecoge && (
          <>
            <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
            <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Persona que recoge</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{cliente.personaRecoge}</div>
          </>
        )}
      </div>

      <div className="actions-row">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
        <button className="btn btn-primary" onClick={confirmar}>Confirmar cita</button>
      </div>
    </div>
  );
}
