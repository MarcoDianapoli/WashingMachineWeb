import { useState } from 'react';
import { useApp } from '../../store';
import { Clock, Activity, ShieldCheck, Plus, X, ArrowRight, DollarSign, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { PAQUETES_POR_TAMANO } from '../../types';
import type { TamanoVehiculo, Cita } from '../../types';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { citas } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardModal, setDashboardModal] = useState<'lavados' | 'ingresos' | 'pendientes' | 'en_curso' | null>(null);
  const [selectedCitaDetails, setSelectedCitaDetails] = useState<Cita | null>(null);
  const [tamano, setTamano] = useState<TamanoVehiculo>('chico');
  
  // Calcular métricas dinámicas basadas en el store global
  const citasHoy = citas.filter(c => c.fecha === '2026-07-15');
  const citasCompletadas = citasHoy.filter(c => c.estado === 'completada');
  const ingresosCalculados = citasCompletadas
    .filter(c => c.pagado)
    .reduce((total, c) => total + parseInt((c.paquetePrecio || '$0').replace('$', '')), 0);
    
  const stats = {
    autosLavadosHoy: citasCompletadas.length,
    ingresosHoy: ingresosCalculados,
    pendientes: citasHoy.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length,
    enCurso: citasHoy.filter(c => c.estado === 'en_proceso').length,
    clientesActivos: Array.from(new Set(citas.map(c => c.cliente.telefono))).length // Clientes únicos
  };

  const citasEnCurso = stats.enCurso;
  
  // Variables adicionales para el desglose de ingresos
  let efectivo = 0, transferencia = 0, tarjeta = 0;
  citasCompletadas.filter(c => c.pagado).forEach(cita => {
    const precioNumerico = parseInt((cita.paquetePrecio || '$0').replace('$', ''));
    if (cita.metodoPago === 'transferencia') transferencia += precioNumerico;
    else if (cita.metodoPago === 'tarjeta') tarjeta += precioNumerico;
    else efectivo += precioNumerico;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Cita registrada correctamente!');
    setIsModalOpen(false);
  };

  const activeCitas = citas
    .filter(c => ['pendiente', 'confirmada', 'en_proceso'].includes(c.estado))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const getStatusBadge = (estado: string) => {
    const map: Record<string, { color: string, label: string }> = {
      'pendiente': { color: 'var(--warning)', label: 'Pendiente' },
      'confirmada': { color: 'var(--primary)', label: 'Confirmada' },
      'en_proceso': { color: 'var(--black)', label: 'En Proceso' },
    };
    const style = map[estado] || { color: 'var(--gray)', label: estado };
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

  const renderList = (lista: Cita[], vacioMensaje: string) => {
    if (lista.length === 0) {
      return <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray)' }}>{vacioMensaje}</div>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
        {lista.map(cita => (
          <div key={cita.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--black)', fontSize: '1.1rem', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                {cita.hora}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'var(--black)' }}>{cita.cliente.nombre}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray)' }}>
                  {cita.cliente.vehiculo.marca} {cita.cliente.vehiculo.placa} • {cita.paqueteNombre}
                </p>
                {cita.lavadorNombre && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Lavador: {cita.lavadorNombre}
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
          onClick={() => setDashboardModal('lavados')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <p>Citas de hoy</p>
            <h3 style={{ color: 'var(--red)' }}>{stats.autosLavadosHoy}</h3>
          </div>
        </div>
        
        <div 
          className="stat-card" 
          onClick={() => setDashboardModal('pendientes')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <p>Pendientes</p>
            <h3 style={{ color: 'var(--red)' }}>{stats.pendientes}</h3>
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => setDashboardModal('ingresos')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-info">
            <p>Ingresos estimados</p>
            <h3>${stats.ingresosHoy}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Clientes activos</p>
            <h3>{stats.clientesActivos}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Lista de Citas convertida a Tabla */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          
          {activeCitas.length === 0 ? (
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
                  {activeCitas.map(cita => (
                    <tr 
                      key={cita.id} 
                      onClick={() => setSelectedCitaDetails(cita)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ fontWeight: 500 }}>{cita.hora}</td>
                      <td>{cita.cliente.nombre}</td>
                      <td>{cita.cliente.vehiculo.tipoVehiculo || 'Auto'}</td>
                      <td>{cita.paqueteNombre?.split(' ')[0] || 'Básico'}</td>
                      <td>
                        <span style={{ 
                          color: cita.estado === 'confirmada' || cita.estado === 'completada' ? 'var(--success)' : 
                                 cita.estado === 'pendiente' ? 'var(--warning)' : 
                                 cita.estado === 'cancelada' ? 'var(--red)' : 'var(--primary)',
                          fontWeight: 500,
                          fontSize: '0.85rem'
                        }}>
                          {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
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
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: citasEnCurso > 0 ? 'var(--primary)' : 'var(--success)' }}></span>
            <span style={{ fontWeight: 600, color: 'var(--gray)' }}>
              {citasEnCurso > 0 ? 'Lavando vehículos...' : 'Operando con normalidad'}
            </span>
          </div>
          
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--light-gray)' }}>
             <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '10px' }}>Lavadores disponibles</p>
             <Link to="/admin/lavadores" className="btn btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>
               Gestionar Personal
             </Link>
          </div>
        </div>

      {/* Modales de Métricas */}
      {dashboardModal && (
        <div className="modal-overlay" onClick={() => setDashboardModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dashboardModal === 'ingresos' && <><DollarSign size={24} color="#8e44ad" /> Desglose de Ingresos</>}
                {dashboardModal === 'lavados' && <><ShieldCheck size={24} color="var(--success)" /> Autos Lavados Hoy</>}
                {dashboardModal === 'pendientes' && <><Clock size={24} color="var(--warning)" /> Citas Pendientes</>}
                {dashboardModal === 'en_curso' && <><Activity size={24} color="var(--primary)" /> Vehículos en Curso</>}
              </h2>
              <button className="modal-close" onClick={() => setDashboardModal(null)}>
                <X size={24} />
              </button>
            </div>
            
            {dashboardModal === 'ingresos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--black)' }}>
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', color: '#27ae60' }}><Banknote size={20} /></div>
                    Efectivo
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${efectivo.toLocaleString('en-US')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--black)' }}>
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', color: '#2980b9' }}><Smartphone size={20} /></div>
                    Transferencia
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${transferencia.toLocaleString('en-US')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--light-gray)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--black)' }}>
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', color: '#f39c12' }}><CreditCard size={20} /></div>
                    Tarjeta
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${tarjeta.toLocaleString('en-US')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px', borderTop: '2px dashed var(--light-gray)', marginTop: '8px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray)' }}>Total del Día</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#8e44ad' }}>${stats.ingresosHoy.toLocaleString('en-US')}</div>
                </div>
              </div>
            )}

            {dashboardModal === 'lavados' && renderList(citasCompletadas, "No hay autos lavados el día de hoy.")}
            {dashboardModal === 'pendientes' && renderList(citasHoy.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada'), "No hay citas pendientes.")}
            {dashboardModal === 'en_curso' && renderList(citasHoy.filter(c => c.estado === 'en_proceso'), "No hay vehículos lavándose en este momento.")}

          </div>
        </div>
      )}

      {/* Modal de Nueva Cita */}
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
                  value={tamano} 
                  onChange={(e) => setTamano(e.target.value as TamanoVehiculo)}
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
                <select className="input-field" required>
                  <option value="">Selecciona un paquete...</option>
                  {PAQUETES_POR_TAMANO[tamano].map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.precio})</option>
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

      {/* Modal Detalles de Cita Seleccionada */}
      {selectedCitaDetails && (
        <div className="modal-overlay" onClick={() => setSelectedCitaDetails(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Detalles de la Cita</h2>
              <button className="modal-close" onClick={() => setSelectedCitaDetails(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Cliente</span>
                <span style={{ fontWeight: 'bold', color: 'var(--black)' }}>{selectedCitaDetails.cliente.nombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Teléfono</span>
                <span style={{ color: 'var(--black)' }}>{selectedCitaDetails.cliente.telefono || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Vehículo</span>
                <span style={{ color: 'var(--black)' }}>
                  {selectedCitaDetails.cliente.vehiculo.marca} {selectedCitaDetails.cliente.vehiculo.modelo} 
                  {selectedCitaDetails.cliente.vehiculo.placa && ` (${selectedCitaDetails.cliente.vehiculo.placa})`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Fecha y Hora</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  {selectedCitaDetails.fecha} a las {selectedCitaDetails.hora}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Paquete</span>
                <span style={{ color: 'var(--black)' }}>{selectedCitaDetails.paqueteNombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{selectedCitaDetails.paquetePrecio}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light-gray)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Lavador Asignado</span>
                <span style={{ color: 'var(--black)' }}>{selectedCitaDetails.lavadorNombre || 'Sin asignar'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Estado</span>
                {getStatusBadge(selectedCitaDetails.estado)}
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
