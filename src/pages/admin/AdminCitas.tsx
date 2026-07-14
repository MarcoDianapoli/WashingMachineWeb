import { useState } from 'react';
import { useApp } from '../../store';
import { Edit2, Trash2, X, CheckCircle, QrCode, UserPlus, CreditCard, Smartphone, Banknote, Car, Check } from 'lucide-react';
import type { Cita, MetodoPago, TamanoVehiculo } from '../../types';
import { PAQUETES_POR_TAMANO } from '../../types';

export default function AdminCitas() {
  const { citas, actualizarCita, eliminarCita, lavadores } = useApp();
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  
  // Estados para nuevos modales
  const [isLavadorModalOpen, setIsLavadorModalOpen] = useState(false);
  const [selectedCitaIdForLavador, setSelectedCitaIdForLavador] = useState<string | null>(null);
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedCitaForQr, setSelectedCitaForQr] = useState<Cita | null>(null);

  const handleStatusChange = (id: string, newStatus: Cita['estado']) => {
    const cita = citas.find(c => c.id === id);
    if (cita) {
      actualizarCita({ ...cita, estado: newStatus });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCita) {
      actualizarCita(editingCita);
      setEditingCita(null);
    }
  };

  const assignLavador = (lavadorId: string, lavadorNombre: string) => {
    if (!selectedCitaIdForLavador) return;
    const cita = citas.find(c => c.id === selectedCitaIdForLavador);
    if (cita) {
      actualizarCita({ ...cita, lavadorId, lavadorNombre });
    }
    setIsLavadorModalOpen(false);
    setSelectedCitaIdForLavador(null);
  };

  const openQr = (cita: Cita) => {
    setSelectedCitaForQr(cita);
    setIsQrModalOpen(true);
  };

  const simulateQrScan = () => {
    if (selectedCitaForQr) {
      actualizarCita({ 
        ...selectedCitaForQr, 
        recogido: true, 
        estado: 'completada' 
      });
      setIsQrModalOpen(false);
      setSelectedCitaForQr(null);
    }
  };

  const getMetodoPagoIcon = (metodo?: MetodoPago) => {
    if (metodo === 'efectivo') return <Banknote size={14} />;
    if (metodo === 'transferencia') return <Smartphone size={14} />;
    if (metodo === 'tarjeta') return <CreditCard size={14} />;
    return null;
  };

  return (
    <div className="page" style={{ maxWidth: '1300px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Gestión de Citas</h1>
        <p style={{ color: 'var(--gray)' }}>Administra y modifica todas las citas registradas</p>
      </header>

      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        {citas.length === 0 ? (
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
              {citas.map((cita) => (
                <tr key={cita.id} style={{ borderBottom: '1px solid var(--light-gray)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 500 }}>
                    {cita.fecha}<br/>
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{cita.hora}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {cita.cliente.nombre}<br/>
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{cita.cliente.telefono}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {cita.cliente.vehiculo.marca} {cita.cliente.vehiculo.modelo}<br/>
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem', fontWeight: 'bold' }}>Placa: {cita.cliente.vehiculo.placa || 'N/A'}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {cita.paqueteNombre}<br/>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{cita.paquetePrecio || '$0'}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    {cita.lavadorNombre ? (
                      <span style={{ fontWeight: 600, color: 'var(--black)' }}>{cita.lavadorNombre}</span>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => {
                          setSelectedCitaIdForLavador(cita.id);
                          setIsLavadorModalOpen(true);
                        }}
                      >
                        <UserPlus size={16} /> Asignar
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {cita.pagado ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <Check size={12} /> Pagado {getMetodoPagoIcon(cita.metodoPago)}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--light-gray)', color: 'var(--gray)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Por pagar
                        </span>
                      )}
                      
                      {cita.recogido ? (
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
                      value={cita.estado}
                      onChange={(e) => handleStatusChange(cita.id, e.target.value as Cita['estado'])}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--gray)',
                        backgroundColor: 'white',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openQr(cita)}
                        style={{ background: 'none', border: 'none', color: 'var(--black)', cursor: 'pointer', padding: '8px' }}
                        title="Ver QR de Recogida"
                      >
                        <QrCode size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingCita(cita)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px' }}
                        title="Editar Cita Completa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas eliminar esta cita permanentemente?')) {
                            eliminarCita(cita.id);
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

      {/* Modal Estilo Llanta para Asignar Lavador */}
      {isLavadorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLavadorModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              backgroundColor: '#1a1a1a', 
              border: '24px solid #0a0a0a', /* Llanta exterior */
              boxShadow: 'inset 0 0 30px #000, 0 10px 40px rgba(0,0,0,0.8)',
              padding: '12px',
              position: 'relative'
            }}
          >
             {/* Rin metálico interior */}
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
                   {lavadores.map(l => (
                      <button 
                        key={l.id} 
                        onClick={() => assignLavador(l.id, l.nombre)}
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
                        {l.nombre}
                      </button>
                   ))}
                 </div>
                 
                 <button 
                   onClick={() => setIsLavadorModalOpen(false)}
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

      {/* Modal para ver QR */}
      {isQrModalOpen && selectedCitaForQr && (
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
                Cita de <strong>{selectedCitaForQr.cliente.nombre}</strong><br/>
                Vehículo: {selectedCitaForQr.cliente.vehiculo.marca} ({selectedCitaForQr.cliente.vehiculo.placa})
              </p>
              
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '2px solid var(--light-gray)' }}>
                {/* Usamos qrserver para generar el QR dinámicamente con los datos de la cita */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`ID:${selectedCitaForQr.id}|Cliente:${selectedCitaForQr.cliente.nombre}|Placa:${selectedCitaForQr.cliente.vehiculo.placa}`)}`} 
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

      {/* Modal para Editar Cita Completa */}
      {editingCita && (
        <div className="modal-overlay" onClick={() => setEditingCita(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Modificar Cita Completa</h2>
              <button className="modal-close" onClick={() => setEditingCita(null)}>
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
                    value={editingCita.cliente.nombre}
                    onChange={e => setEditingCita({...editingCita, cliente: { ...editingCita.cliente, nombre: e.target.value }})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Teléfono</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={editingCita.cliente.telefono}
                    onChange={e => setEditingCita({...editingCita, cliente: { ...editingCita.cliente, telefono: e.target.value }})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Vehículo (Marca/Modelo)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={`${editingCita.cliente.vehiculo.marca} ${editingCita.cliente.vehiculo.modelo}`}
                    onChange={e => {
                      const val = e.target.value.split(' ');
                      setEditingCita({...editingCita, cliente: { 
                        ...editingCita.cliente, 
                        vehiculo: { ...editingCita.cliente.vehiculo, marca: val[0] || '', modelo: val.slice(1).join(' ') }
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
                    value={editingCita.cliente.vehiculo.placa}
                    onChange={e => setEditingCita({...editingCita, cliente: { ...editingCita.cliente, vehiculo: { ...editingCita.cliente.vehiculo, placa: e.target.value } }})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Tamaño del Vehículo</label>
                  <select 
                    className="input-field" 
                    value={editingCita.cliente.vehiculo.tipoVehiculo || 'chico'}
                    onChange={e => {
                      const nuevoTamano = e.target.value;
                      setEditingCita({
                        ...editingCita, 
                        cliente: { 
                          ...editingCita.cliente, 
                          vehiculo: { ...editingCita.cliente.vehiculo, tipoVehiculo: nuevoTamano }
                        },
                        // Al cambiar de tamaño, reseteamos el paquete para que elija uno válido
                        paqueteId: '',
                        paqueteNombre: 'Paquete modificado',
                        paquetePrecio: '$0'
                      });
                    }}
                    required
                  >
                    <option value="chico">Auto Chico (Sedán, Hatchback)</option>
                    <option value="mediano">Mediano (SUV, Crossover)</option>
                    <option value="grande">Grande (Camioneta, Van)</option>
                    <option value="moto">Motocicleta</option>
                    <option value="trailer">Trailer / Remolque</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Paquete a realizar</label>
                  <select 
                    className="input-field" 
                    value={editingCita.paqueteId}
                    onChange={e => {
                      const tamanoActual = (editingCita.cliente.vehiculo.tipoVehiculo || 'chico') as TamanoVehiculo;
                      const paqueteSeleccionado = PAQUETES_POR_TAMANO[tamanoActual].find(p => p.id === e.target.value);
                      if (paqueteSeleccionado) {
                        setEditingCita({
                          ...editingCita,
                          paqueteId: paqueteSeleccionado.id,
                          paqueteNombre: paqueteSeleccionado.nombre,
                          paquetePrecio: paqueteSeleccionado.precio
                        });
                      }
                    }}
                    required
                  >
                    <option value="">Selecciona un paquete...</option>
                    {PAQUETES_POR_TAMANO[(editingCita.cliente.vehiculo.tipoVehiculo || 'chico') as TamanoVehiculo]?.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.precio})</option>
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
                    value={editingCita.fecha}
                    onChange={e => setEditingCita({...editingCita, fecha: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Hora</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={editingCita.hora}
                    onChange={e => setEditingCita({...editingCita, hora: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Nueva sección de Pago y Entrega */}
              <div style={{ padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px', marginTop: '8px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--black)' }}>Control de Pago y Entrega</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="checkbox" 
                        checked={editingCita.pagado || false}
                        onChange={e => setEditingCita({ ...editingCita, pagado: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      Servicio Pagado
                    </label>
                    
                    {editingCita.pagado && (
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <select 
                          className="input-field"
                          value={editingCita.metodoPago || ''}
                          onChange={e => setEditingCita({ ...editingCita, metodoPago: e.target.value as MetodoPago })}
                          required={editingCita.pagado}
                        >
                          <option value="">Selecciona Método...</option>
                          <option value="efectivo">Efectivo</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="tarjeta">Tarjeta</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="checkbox" 
                        checked={editingCita.recogido || false}
                        onChange={e => setEditingCita({ 
                          ...editingCita, 
                          recogido: e.target.checked,
                          estado: e.target.checked ? 'completada' : editingCita.estado
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
                  value={editingCita.cliente.notas || ''}
                  onChange={e => setEditingCita({
                    ...editingCita, 
                    cliente: { ...editingCita.cliente, notas: e.target.value }
                  })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingCita(null)}>
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
