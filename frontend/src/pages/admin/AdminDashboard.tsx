import { useState } from 'react';
import { useApp } from '../../store';
import { Clock, Activity, ShieldCheck, Plus, X, DollarSign, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { PACKAGES_BY_SIZE } from '../../types';
import type { VehicleSize, Appointment } from '../../types';
import { Link } from 'react-router-dom';

type DashboardModal = 'washed' | 'income' | 'pending' | 'in_progress' | null;

export default function AdminDashboard() {
  const { appointments } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardModal, setDashboardModal] = useState<DashboardModal>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [size, setSize] = useState<VehicleSize>('small');

  // Metrics derived from the global store
  const todaysAppointments = appointments.filter(a => a.date === '2026-07-15');
  const completedAppointments = todaysAppointments.filter(a => a.status === 'completed');
  const estimatedIncome = completedAppointments
    .filter(a => a.paid)
    .reduce((total, a) => total + parseInt((a.packagePrice || '$0').replace('$', '')), 0);

  const stats = {
    washedToday: completedAppointments.length,
    incomeToday: estimatedIncome,
    pending: todaysAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
    inProgress: todaysAppointments.filter(a => a.status === 'in_progress').length,
    activeCustomers: Array.from(new Set(appointments.map(a => a.customer.phone))).length
  };

  const inProgressCount = stats.inProgress;

  // Income breakdown by payment method
  let cash = 0, transfer = 0, card = 0;
  completedAppointments.filter(a => a.paid).forEach(appointment => {
    const amount = parseInt((appointment.packagePrice || '$0').replace('$', ''));
    if (appointment.paymentMethod === 'transfer') transfer += amount;
    else if (appointment.paymentMethod === 'card') card += amount;
    else cash += amount;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Cita registrada correctamente!');
    setIsModalOpen(false);
  };

  const activeAppointments = appointments
    .filter(a => ['pending', 'confirmed', 'in_progress'].includes(a.status))
    .sort((a, b) => a.time.localeCompare(b.time));

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string, label: string }> = {
      pending: { color: 'var(--warning)', label: 'Pendiente' },
      confirmed: { color: 'var(--primary)', label: 'Confirmada' },
      in_progress: { color: 'var(--black)', label: 'En Proceso' },
    };
    const style = map[status] || { color: 'var(--gray)', label: status };
    return (
      <span style={{
        backgroundColor: `${style.color}15`,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '50px',
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        {style.label}
      </span>
    );
  };

  const STATUS_LABEL: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    in_progress: 'En Proceso',
    ready_for_pickup: 'Listo para Entrega',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  const renderList = (list: Appointment[], emptyMessage: string) => {
    if (list.length === 0) {
      return <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray)' }}>{emptyMessage}</div>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
        {list.map(appointment => (
          <div key={appointment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--black)', fontSize: '1.1rem', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                {appointment.time}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'var(--black)' }}>{appointment.customer.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray)' }}>
                  {appointment.customer.vehicle.make} {appointment.customer.vehicle.plate} • {appointment.packageName}
                </p>
                {appointment.washerName && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Lavador: {appointment.washerName}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page" style={{ maxWidth: '1000px', padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--black)', margin: 0 }}>Resumen operativo</h2>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => { setDashboardModal(null); setIsModalOpen(true); }}
        >
          <Plus size={20} />
          Registrar Nueva Cita
        </button>
      </div>

      <div className="dashboard-stats">
        <div
          className="stat-card"
          onClick={() => setDashboardModal('washed')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <p>Citas de hoy</p>
            <h3 style={{ color: 'var(--red)' }}>{stats.washedToday}</h3>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setDashboardModal('pending')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <p>Pendientes</p>
            <h3 style={{ color: 'var(--red)' }}>{stats.pending}</h3>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setDashboardModal('income')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <p>Ingresos estimados</p>
            <h3>${stats.incomeToday}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Clientes activos</p>
            <h3>{stats.activeCustomers}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Appointment list as a table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

          {activeAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray)' }}>
              No hay citas pendientes para hoy.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Servicio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAppointments.map(appointment => (
                    <tr
                      key={appointment.id}
                      onClick={() => setSelectedAppointment(appointment)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ fontWeight: 500 }}>{appointment.time}</td>
                      <td>{appointment.customer.name}</td>
                      <td>{appointment.customer.vehicle.vehicleType || 'Auto'}</td>
                      <td>{appointment.packageName?.split(' ')[0] || 'Básico'}</td>
                      <td>
                        <span style={{
                          color: appointment.status === 'confirmed' || appointment.status === 'completed' ? 'var(--success)' :
                                 appointment.status === 'pending' ? 'var(--warning)' :
                                 appointment.status === 'cancelled' ? 'var(--red)' : 'var(--primary)',
                          fontWeight: 500,
                          fontSize: '0.85rem'
                        }}>
                          {STATUS_LABEL[appointment.status] ?? appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '32px', textAlign: 'center', marginTop: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--black)' }}>Estado del Autolavado</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--light-gray)', padding: '12px 24px', borderRadius: '50px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: inProgressCount > 0 ? 'var(--primary)' : 'var(--success)' }}></span>
            <span style={{ fontWeight: 600, color: 'var(--gray)' }}>
              {inProgressCount > 0 ? 'Lavando vehículos...' : 'Operando con normalidad'}
            </span>
          </div>

          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--light-gray)' }}>
             <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '10px' }}>Lavadores disponibles</p>
             <Link to="/admin/lavadores" className="btn btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>
               Gestionar Personal
             </Link>
          </div>
        </div>

      {/* Metric modals */}
      {dashboardModal && (
        <div className="modal-overlay" onClick={() => setDashboardModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dashboardModal === 'income' && <><DollarSign size={24} color="#8e44ad" /> Desglose de Ingresos</>}
                {dashboardModal === 'washed' && <><ShieldCheck size={24} color="var(--success)" /> Autos Lavados Hoy</>}
                {dashboardModal === 'pending' && <><Clock size={24} color="var(--warning)" /> Citas Pendientes</>}
                {dashboardModal === 'in_progress' && <><Activity size={24} color="var(--primary)" /> Vehículos en Curso</>}
              </h2>
              <button className="modal-close" onClick={() => setDashboardModal(null)}>
                <X size={24} />
              </button>
            </div>

            {dashboardModal === 'income' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--black)' }}>
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', color: '#27ae60' }}><Banknote size={20} /></div>
                    Efectivo
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${cash.toLocaleString('en-US')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--black)' }}>
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', color: '#2980b9' }}><Smartphone size={20} /></div>
                    Transferencia
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${transfer.toLocaleString('en-US')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--black)' }}>
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', color: '#f39c12' }}><CreditCard size={20} /></div>
                    Tarjeta
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${card.toLocaleString('en-US')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px', borderTop: '2px dashed var(--light-gray)', marginTop: '8px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray)' }}>Total del Día</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#8e44ad' }}>${stats.incomeToday.toLocaleString('en-US')}</div>
                </div>
              </div>
            )}

            {dashboardModal === 'washed' && renderList(completedAppointments, "No hay autos lavados el día de hoy.")}
            {dashboardModal === 'pending' && renderList(todaysAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed'), "No hay citas pendientes.")}
            {dashboardModal === 'in_progress' && renderList(todaysAppointments.filter(a => a.status === 'in_progress'), "No hay vehículos lavándose en este momento.")}

          </div>
        </div>
      )}

      {/* Quick appointment modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Registrar Cita Rápida</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Nombre del Cliente</label>
                <input type="text" className="input-field" placeholder="Ej. Juan Pérez" required />
              </div>

              <div className="input-group">
                <label className="input-label">Teléfono (opcional)</label>
                <input type="tel" className="input-field" placeholder="10 dígitos" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Vehículo (Marca/Modelo)</label>
                  <input type="text" className="input-field" placeholder="Ej. Honda Civic" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Placas (opcional)</label>
                  <input type="text" className="input-field" placeholder="ABC-123" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Tamaño del Vehículo</label>
                <select
                  className="input-field"
                  value={size}
                  onChange={(e) => setSize(e.target.value as VehicleSize)}
                >
                  <option value="small">Auto Chico (Sedán, Hatchback)</option>
                  <option value="medium">Mediano (SUV, Crossover)</option>
                  <option value="large">Grande (Camioneta, Van)</option>
                  <option value="motorcycle">Motocicleta</option>
                  <option value="trailer">Trailer / Remolque</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Paquete a realizar</label>
                <select className="input-field" required>
                  <option value="">Selecciona un paquete...</option>
                  {PACKAGES_BY_SIZE[size].map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price})</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Hora de la cita</label>
                <input type="time" className="input-field" required />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected appointment details */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Detalles de la Cita</h2>
              <button className="modal-close" onClick={() => setSelectedAppointment(null)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Cliente</span>
                <span style={{ fontWeight: 'bold', color: 'var(--black)' }}>{selectedAppointment.customer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Teléfono</span>
                <span style={{ color: 'var(--black)' }}>{selectedAppointment.customer.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Vehículo</span>
                <span style={{ color: 'var(--black)' }}>
                  {selectedAppointment.customer.vehicle.make} {selectedAppointment.customer.vehicle.model}
                  {selectedAppointment.customer.vehicle.plate && ` (${selectedAppointment.customer.vehicle.plate})`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Fecha y Hora</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  {selectedAppointment.date} a las {selectedAppointment.time}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Paquete</span>
                <span style={{ color: 'var(--black)' }}>{selectedAppointment.packageName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{selectedAppointment.packagePrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Lavador Asignado</span>
                <span style={{ color: 'var(--black)' }}>{selectedAppointment.washerName || 'Sin asignar'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Estado</span>
                {getStatusBadge(selectedAppointment.status)}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--light-gray)' }}>
                <Link
                  to="/admin/citas"
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Modificar Cita Completa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
