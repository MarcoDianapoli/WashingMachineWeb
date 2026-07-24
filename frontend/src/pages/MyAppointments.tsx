import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import type { Appointment } from '../types';

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#dc2626',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En Proceso',
  ready_for_pickup: 'Listo para Entrega',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment, deleteAppointment, customer } = useApp();
  const [selected, setSelected] = useState<Appointment | null>(null);

  if (!customer) {
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

  const canCancel = selected && (selected.status === 'pending' || selected.status === 'confirmed');

  const confirmCancel = () => {
    if (!selected) return;
    if (window.confirm(`¿Estás seguro de cancelar la cita del ${selected.date} a las ${selected.time}?`)) {
      cancelAppointment(selected.id);
      setSelected(null);
    }
  };

  const confirmDelete = () => {
    if (!selected) return;
    if (window.confirm('Esta acción eliminará la cita permanentemente. ¿Continuar?')) {
      deleteAppointment(selected.id);
      setSelected(null);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Mis Citas</h1>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No tienes citas agendadas</p>
          <p className="empty-text">Presiona el botón inferior para agendar una nueva cita.</p>
          <button className="btn btn-primary" onClick={() => navigate('/paquetes')}>Agendar cita</button>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((a) => (
            <div key={a.id} className="appointment-card" onClick={() => setSelected(a)}>
              <div className="appointment-header">
                <span className="appointment-name">{a.packageName}</span>
                <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status]}</span>
              </div>
              <div className="appointment-date">{a.date} — {a.time}</div>
              <div className="appointment-client">{a.customer.name} • {a.customer.vehicle.plate || 'sin placa'}</div>
            </div>
          ))}
        </div>
      )}

      <div className="footer-fixed">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/paquetes')}>
          + Registrar nueva cita
        </button>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selected.packageName}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>Cerrar</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span className={`status-badge`} style={{ background: STATUS_COLOR[selected.status] + '20', color: STATUS_COLOR[selected.status] }}>
                {STATUS_LABEL[selected.status]}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Fecha</span>
              <span className="detail-value">{selected.date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Hora</span>
              <span className="detail-value">{selected.time}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Cliente</span>
              <span className="detail-value">{selected.customer.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Teléfono</span>
              <span className="detail-value">{selected.customer.phone}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Vehículo</span>
              <span className="detail-value">
                {selected.customer.vehicle.make} {selected.customer.vehicle.model}
                {selected.customer.vehicle.plate ? ` · ${selected.customer.vehicle.plate}` : ''}
              </span>
            </div>

            <div className="actions-row">
              {canCancel && (
                <button className="btn btn-warning" onClick={confirmCancel}>Cancelar cita</button>
              )}
              <button className="btn btn-danger" onClick={confirmDelete}>Eliminar cita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
