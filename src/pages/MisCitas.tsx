import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import type { Cita } from '../types';

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#f59e0b',
  confirmada: '#dc2626',
  completada: '#10b981',
  cancelada: '#ef4444',
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function MisCitas() {
  const navigate = useNavigate();
  const { citas, cancelarCita, eliminarCita, cliente } = useApp();
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  if (!cliente) {
    return (
      <div className="page">
        <h1 className="page-title">Mis Citas</h1>
        <div className="empty-state">
          <p className="empty-title">Regístrate para comenzar</p>
          <p className="empty-text">Crea una cuenta para agendar y administrar tus citas.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Registrarse</button>
        </div>
      </div>
    );
  }

  const puedeCancelar = citaSeleccionada && (citaSeleccionada.estado === 'pendiente' || citaSeleccionada.estado === 'confirmada');

  const confirmarCancelar = () => {
    if (!citaSeleccionada) return;
    if (window.confirm(`¿Estás seguro de cancelar la cita del ${citaSeleccionada.fecha} a las ${citaSeleccionada.hora}?`)) {
      cancelarCita(citaSeleccionada.id);
      setCitaSeleccionada(null);
    }
  };

  const confirmarEliminar = () => {
    if (!citaSeleccionada) return;
    if (window.confirm('Esta acción eliminará la cita permanentemente. ¿Continuar?')) {
      eliminarCita(citaSeleccionada.id);
      setCitaSeleccionada(null);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Mis Citas</h1>

      {citas.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No tienes citas agendadas</p>
          <p className="empty-text">Presiona el botón inferior para agendar una nueva cita.</p>
          <button className="btn btn-primary" onClick={() => navigate('/paquetes')}>Agendar cita</button>
        </div>
      ) : (
        <div className="citas-list">
          {citas.map((c, i) => (
            <div key={c.id} className="cita-card" onClick={() => setCitaSeleccionada(c)}>
              <div className="cita-header">
                <span className="cita-name">{c.paqueteNombre}</span>
                <span className={`badge badge-${c.estado}`}>{ESTADO_LABEL[c.estado]}</span>
              </div>
              <div className="cita-date">{c.fecha} — {c.hora}</div>
              <div className="cita-client">{c.cliente.nombre} • {c.cliente.vehiculo.placa || 'sin placa'}</div>
            </div>
          ))}
        </div>
      )}

      <div className="footer-fixed">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/paquetes')}>
          + Registrar nueva cita
        </button>
      </div>

      {citaSeleccionada && (
        <div className="modal-overlay" onClick={() => setCitaSeleccionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{citaSeleccionada.paqueteNombre}</h3>
              <button className="modal-close" onClick={() => setCitaSeleccionada(null)}>Cerrar</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span className={`status-badge`} style={{ background: ESTADO_COLOR[citaSeleccionada.estado] + '20', color: ESTADO_COLOR[citaSeleccionada.estado] }}>
                {ESTADO_LABEL[citaSeleccionada.estado]}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Fecha</span>
              <span className="detail-value">{citaSeleccionada.fecha}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Hora</span>
              <span className="detail-value">{citaSeleccionada.hora}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Cliente</span>
              <span className="detail-value">{citaSeleccionada.cliente.nombre}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Teléfono</span>
              <span className="detail-value">{citaSeleccionada.cliente.telefono}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Vehículo</span>
              <span className="detail-value">
                {citaSeleccionada.cliente.vehiculo.marca} {citaSeleccionada.cliente.vehiculo.modelo}
                {citaSeleccionada.cliente.vehiculo.placa ? ` · ${citaSeleccionada.cliente.vehiculo.placa}` : ''}
              </span>
            </div>

            <div className="actions-row">
              {puedeCancelar && (
                <button className="btn btn-warning" onClick={confirmarCancelar}>Cancelar cita</button>
              )}
              <button className="btn btn-danger" onClick={confirmarEliminar}>Eliminar cita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
