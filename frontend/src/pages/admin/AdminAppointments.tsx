import { useState } from 'react';
import { useApp } from '../../store';
import { Edit2, Trash2, X, CheckCircle, QrCode, UserPlus, CreditCard, Smartphone, Banknote, Car, Check } from 'lucide-react';
import type { Appointment, PaymentMethod, VehicleSize } from '../../types';
import { PACKAGES_BY_SIZE } from '../../types';

export default function AdminAppointments() {
  const { appointments, updateAppointment, deleteAppointment, washers } = useApp();
  const [editing, setEditing] = useState<Appointment | null>(null);

  const [isWasherModalOpen, setIsWasherModalOpen] = useState(false);
  const [appointmentIdForWasher, setAppointmentIdForWasher] = useState<string | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [appointmentForQr, setAppointmentForQr] = useState<Appointment | null>(null);

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      updateAppointment({ ...appointment, status: newStatus });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateAppointment(editing);
      setEditing(null);
    }
  };

  const assignWasher = (washerId: string, washerName: string) => {
    if (!appointmentIdForWasher) return;
    const appointment = appointments.find(a => a.id === appointmentIdForWasher);
    if (appointment) {
      updateAppointment({ ...appointment, washerId, washerName });
    }
    setIsWasherModalOpen(false);
    setAppointmentIdForWasher(null);
  };

  const openQr = (appointment: Appointment) => {
    setAppointmentForQr(appointment);
    setIsQrModalOpen(true);
  };

  const simulateQrScan = () => {
    if (appointmentForQr) {
      updateAppointment({
        ...appointmentForQr,
        pickedUp: true,
        status: 'completed'
      });
      setIsQrModalOpen(false);
      setAppointmentForQr(null);
    }
  };

  const getPaymentMethodIcon = (method?: PaymentMethod) => {
    if (method === 'cash') return <Banknote size={14} />;
    if (method === 'transfer') return <Smartphone size={14} />;
    if (method === 'card') return <CreditCard size={14} />;
    return null;
  };

  return (
    <div className="page" style={{ maxWidth: '1300px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Gestión de Citas</h1>
        <p style={{ color: 'var(--gray)' }}>Administra y modifica todas las citas registradas</p>
      </header>

      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
            No hay citas registradas en el sistema.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--light-gray)', color: 'var(--gray)' }}>
                <th style={{ padding: '12px', fontWeight: 600 }}>Fecha / Hora</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Cliente</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Vehículo</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Paquete</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Lavador</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Pago / Entrega</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} style={{ borderBottom: '1px solid var(--light-gray)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 500 }}>
                    {appointment.date}<br/>
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{appointment.time}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {appointment.customer.name}<br/>
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{appointment.customer.phone}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {appointment.customer.vehicle.make} {appointment.customer.vehicle.model}<br/>
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem', fontWeight: 'bold' }}>Placa: {appointment.customer.vehicle.plate || 'N/A'}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {appointment.packageName}<br/>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{appointment.packagePrice || '$0'}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {appointment.washerName ? (
                      <span style={{ fontWeight: 600, color: 'var(--black)' }}>{appointment.washerName}</span>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => {
                          setAppointmentIdForWasher(appointment.id);
                          setIsWasherModalOpen(true);
                        }}
                      >
                        <UserPlus size={16} /> Asignar
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {appointment.paid ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <Check size={12} /> Pagado {getPaymentMethodIcon(appointment.paymentMethod)}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--light-gray)', color: 'var(--gray)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Por pagar
                        </span>
                      )}

                      {appointment.pickedUp ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <Car size={12} /> Entregado
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--warning)', color: 'var(--black)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          En Local
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--gray)',
                        backgroundColor: 'white',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="in_progress">En Proceso</option>
                      <option value="ready_for_pickup">Listo para Entrega</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openQr(appointment)}
                        style={{ background: 'none', border: 'none', color: 'var(--black)', cursor: 'pointer', padding: '8px' }}
                        title="Ver QR de Recogida"
                      >
                        <QrCode size={18} />
                      </button>
                      <button
                        onClick={() => setEditing(appointment)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px' }}
                        title="Editar Cita Completa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas eliminar esta cita permanentemente?')) {
                            deleteAppointment(appointment.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '8px' }}
                        title="Eliminar Cita"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tire-styled modal for assigning a washer */}
      {isWasherModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWasherModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              backgroundColor: '#1a1a1a',
              border: '24px solid #0a0a0a', /* Outer tire */
              boxShadow: 'inset 0 0 30px #000, 0 10px 40px rgba(0,0,0,0.8)',
              padding: '12px',
              position: 'relative'
            }}
          >
             {/* Inner metallic rim */}
             <div style={{
               width: '100%',
               height: '100%',
               borderRadius: '50%',
               border: '8px solid #666',
               background: 'radial-gradient(circle, #444 0%, #111 100%)',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               padding: '20px',
               boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)'
             }}>
                 <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.1rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   Asignar Lavador
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                   {washers.map(w => (
                      <button
                        key={w.id}
                        onClick={() => assignWasher(w.id, w.name)}
                        style={{
                          background: 'linear-gradient(to right, #e60000, #b30000)',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(230,0,0,0.4)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {w.name}
                      </button>
                   ))}
                 </div>

                 <button
                   onClick={() => setIsWasherModalOpen(false)}
                   style={{
                     position: 'absolute',
                     top: '-20px',
                     right: '-20px',
                     background: '#fff',
                     color: '#000',
                     border: 'none',
                     borderRadius: '50%',
                     width: '36px',
                     height: '36px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     cursor: 'pointer',
                     boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                   }}
                 >
                   <X size={20} />
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* QR modal */}
      {isQrModalOpen && appointmentForQr && (
        <div className="modal-overlay" onClick={() => setIsQrModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="modal-title">Código de Recogida</h2>
              <button className="modal-close" onClick={() => setIsQrModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ color: 'var(--gray)', marginBottom: '24px' }}>
                Cita de <strong>{appointmentForQr.customer.name}</strong><br/>
                Vehículo: {appointmentForQr.customer.vehicle.make} ({appointmentForQr.customer.vehicle.plate})
              </p>

              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '2px solid var(--light-gray)' }}>
                {/* qrserver generates the QR from the appointment data */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`ID:${appointmentForQr.id}|Cliente:${appointmentForQr.customer.name}|Placa:${appointmentForQr.customer.vehicle.plate}`)}`}
                  alt="QR Code"
                  style={{ display: 'block' }}
                />
              </div>

              <p style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--gray)' }}>
                El cliente presentará este código. Al escanearlo, el vehículo se entregará y la cita finalizará.
              </p>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={simulateQrScan}
              >
                <QrCode size={20} />
                Simular Escaneo por Lavador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Modificar Cita Completa</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Nombre del Cliente</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editing.customer.name}
                    onChange={e => setEditing({...editing, customer: { ...editing.customer, name: e.target.value }})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Teléfono</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={editing.customer.phone}
                    onChange={e => setEditing({...editing, customer: { ...editing.customer, phone: e.target.value }})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Vehículo (Marca/Modelo)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={`${editing.customer.vehicle.make} ${editing.customer.vehicle.model}`}
                    onChange={e => {
                      const val = e.target.value.split(' ');
                      setEditing({...editing, customer: {
                        ...editing.customer,
                        vehicle: { ...editing.customer.vehicle, make: val[0] || '', model: val.slice(1).join(' ') }
                      }});
                    }}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Placas</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editing.customer.vehicle.plate}
                    onChange={e => setEditing({...editing, customer: { ...editing.customer, vehicle: { ...editing.customer.vehicle, plate: e.target.value } }})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Tamaño del Vehículo</label>
                  <select
                    className="input-field"
                    value={editing.customer.vehicle.vehicleType || 'small'}
                    onChange={e => {
                      const newSize = e.target.value;
                      setEditing({
                        ...editing,
                        customer: {
                          ...editing.customer,
                          vehicle: { ...editing.customer.vehicle, vehicleType: newSize }
                        },
                        // Changing the size resets the package so a valid one is chosen
                        packageId: '',
                        packageName: 'Paquete modificado',
                        packagePrice: '$0'
                      });
                    }}
                    required
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
                  <select
                    className="input-field"
                    value={editing.packageId}
                    onChange={e => {
                      const currentSize = (editing.customer.vehicle.vehicleType || 'small') as VehicleSize;
                      const selectedPackage = PACKAGES_BY_SIZE[currentSize].find(p => p.id === e.target.value);
                      if (selectedPackage) {
                        setEditing({
                          ...editing,
                          packageId: selectedPackage.id,
                          packageName: selectedPackage.name,
                          packagePrice: selectedPackage.price
                        });
                      }
                    }}
                    required
                  >
                    <option value="">Selecciona un paquete...</option>
                    {PACKAGES_BY_SIZE[(editing.customer.vehicle.vehicleType || 'small') as VehicleSize]?.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Fecha</label>
                  <input
                    type="date"
                    className="input-field"
                    value={editing.date}
                    onChange={e => setEditing({...editing, date: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Hora</label>
                  <input
                    type="time"
                    className="input-field"
                    value={editing.time}
                    onChange={e => setEditing({...editing, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Payment and delivery section */}
              <div style={{ padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px', marginTop: '8px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--black)' }}>Control de Pago y Entrega</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={editing.paid || false}
                        onChange={e => setEditing({ ...editing, paid: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      Servicio Pagado
                    </label>

                    {editing.paid && (
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <select
                          className="input-field"
                          value={editing.paymentMethod || ''}
                          onChange={e => setEditing({ ...editing, paymentMethod: e.target.value as PaymentMethod })}
                          required={editing.paid}
                        >
                          <option value="">Selecciona Método...</option>
                          <option value="cash">Efectivo</option>
                          <option value="transfer">Transferencia</option>
                          <option value="card">Tarjeta</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={editing.pickedUp || false}
                        onChange={e => setEditing({
                          ...editing,
                          pickedUp: e.target.checked,
                          status: e.target.checked ? 'completed' : editing.status
                        })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      Vehículo Entregado (Recogido)
                    </label>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray)' }}>
                      Al marcar como entregado, el estado pasará a "Completada".
                    </p>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Notas / Observaciones</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={editing.customer.notes || ''}
                  onChange={e => setEditing({
                    ...editing,
                    customer: { ...editing.customer, notes: e.target.value }
                  })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle size={20} />
                  Guardar Cambios Completos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
