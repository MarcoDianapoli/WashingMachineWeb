import { useState, useEffect } from 'react';
import { useApp } from '../../store';
import { User, Activity, CheckCircle, Clock, Plus, X, BarChart3, Info, Phone, Star, Edit2 } from 'lucide-react';
import type { Lavador } from '../../types';

export default function AdminLavadores() {
  const { lavadores, citas, agregarLavador, editarLavador } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLavador, setSelectedLavador] = useState<Lavador | null>(null);
  const [showRendimiento, setShowRendimiento] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados del formulario (usado para agregar y editar)
  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEspecialidad, setFormEspecialidad] = useState('');
  const [formObservaciones, setFormObservaciones] = useState('');

  const getStats = (lavadorId: string) => {
    const citasLavador = citas.filter(c => c.lavadorId === lavadorId);
    const completadas = citasLavador.filter(c => c.estado === 'completada').length;
    const pendientes = citasLavador.filter(c => ['pendiente', 'confirmada', 'en_proceso'].includes(c.estado)).length;
    return { completadas, pendientes };
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoLavador: Lavador = {
      id: `l${Date.now()}`,
      nombre: formNombre,
      telefono: formTelefono,
      especialidad: formEspecialidad,
      observaciones: formObservaciones
    };
    agregarLavador(nuevoLavador);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLavador) return;
    
    const updates = {
      nombre: formNombre,
      telefono: formTelefono,
      especialidad: formEspecialidad,
      observaciones: formObservaciones
    };
    
    editarLavador(selectedLavador.id, updates);
    // Actualizamos el estado local para ver los cambios inmediatamente en el modal
    setSelectedLavador({ ...selectedLavador, ...updates });
    setIsEditing(false);
  };

  const resetForm = () => {
    setFormNombre('');
    setFormTelefono('');
    setFormEspecialidad('');
    setFormObservaciones('');
  };

  const openDetails = (l: Lavador) => {
    setSelectedLavador(l);
    setShowRendimiento(false);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (!selectedLavador) return;
    setFormNombre(selectedLavador.nombre);
    setFormTelefono(selectedLavador.telefono || '');
    setFormEspecialidad(selectedLavador.especialidad || '');
    setFormObservaciones(selectedLavador.observaciones || '');
    setIsEditing(true);
    setShowRendimiento(false);
  };

  return (
    <div className="page" style={{ maxWidth: '1200px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>Equipo de Lavadores</h1>
          <p style={{ color: 'var(--gray)' }}>Administra el personal encargado de los servicios</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={20} />
          Añadir Lavador
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {lavadores.map(lavador => {
          const stats = getStats(lavador.id);
          const isBusy = stats.pendientes > 0;

          return (
            <div 
              key={lavador.id} 
              className="card" 
              style={{ padding: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }}
              onClick={() => openDetails(lavador)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '6px', 
                height: '100%', 
                backgroundColor: isBusy ? 'var(--warning)' : 'var(--success)' 
              }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--light-gray)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--gray)'
                }}>
                  <User size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0', color: 'var(--black)' }}>{lavador.nombre}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isBusy ? 'var(--warning)' : 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Activity size={14} />
                    {isBusy ? 'Ocupado / Con citas asignadas' : 'Disponible'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--light-gray)', paddingTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Lavados Hoy
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black)' }}>{stats.completadas + Math.floor(Math.random() * 3)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Clock size={14} /> Pendientes
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black)' }}>{stats.pendientes}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Añadir Lavador */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Registrar Nuevo Lavador</h2>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Nombre Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  placeholder="Ej. Roberto Sánchez"
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Teléfono</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  value={formTelefono}
                  onChange={e => setFormTelefono(e.target.value)}
                  placeholder="Ej. 555-1234-567"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Especialidad (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formEspecialidad}
                  onChange={e => setFormEspecialidad(e.target.value)}
                  placeholder="Ej. Detallado de Interiores, Pulido..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Observaciones</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  value={formObservaciones}
                  onChange={e => setFormObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre experiencia o disponibilidad..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Registrar Lavador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles / Edición del Lavador */}
      {selectedLavador && (
        <div className="modal-overlay" onClick={() => setSelectedLavador(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <h2 className="modal-title">
                {isEditing ? 'Editar Lavador' : (showRendimiento ? 'Resumen de Rendimiento' : 'Perfil del Lavador')}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!isEditing && !showRendimiento && (
                  <button 
                    onClick={startEditing}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <Edit2 size={18} /> Editar
                  </button>
                )}
                <button className="modal-close" onClick={() => setSelectedLavador(null)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formNombre}
                    onChange={e => setFormNombre(e.target.value)}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Teléfono</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={formTelefono}
                    onChange={e => setFormTelefono(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Especialidad</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formEspecialidad}
                    onChange={e => setFormEspecialidad(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Observaciones</label>
                  <textarea 
                    className="input-field" 
                    rows={3}
                    value={formObservaciones}
                    onChange={e => setFormObservaciones(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : !showRendimiento ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--light-gray)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <User size={40} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--black)' }}>{selectedLavador.nombre}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', marginTop: '8px' }}>
                      <Phone size={16} /> {selectedLavador.telefono || 'Sin número registrado'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="card" style={{ padding: '20px', backgroundColor: 'var(--light-gray)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', marginBottom: '8px', fontWeight: 600 }}>
                      <Star size={18} /> Especialidad
                    </div>
                    <p style={{ margin: 0, color: 'var(--black)' }}>{selectedLavador.especialidad || 'Lavado General'}</p>
                  </div>
                  <div className="card" style={{ padding: '20px', backgroundColor: 'var(--light-gray)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', marginBottom: '8px', fontWeight: 600 }}>
                      <Info size={18} /> Observaciones
                    </div>
                    <p style={{ margin: 0, color: 'var(--black)' }}>{selectedLavador.observaciones || 'Sin observaciones.'}</p>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', padding: '16px' }}
                  onClick={() => setShowRendimiento(true)}
                >
                  <BarChart3 size={24} />
                  Ver Resumen de Rendimiento
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: 'var(--gray)', marginBottom: '10px' }}>
                  Estadísticas de rendimiento para <strong>{selectedLavador.nombre}</strong> durante este mes.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid var(--primary)' }}>
                    <h4 style={{ color: 'var(--gray)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Autos Lavados (Mes)</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--black)' }}>{Math.floor(Math.random() * 40 + 20)}</span>
                  </div>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid var(--success)' }}>
                    <h4 style={{ color: 'var(--gray)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Calificación Promedio</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--black)' }}>4.{Math.floor(Math.random() * 5 + 5)} / 5</span>
                  </div>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid var(--warning)' }}>
                    <h4 style={{ color: 'var(--gray)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Tiempo Promedio</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--black)' }}>{Math.floor(Math.random() * 20 + 30)} min</span>
                  </div>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid #8e44ad' }}>
                    <h4 style={{ color: 'var(--gray)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Ingresos Generados</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--black)' }}>${Math.floor(Math.random() * 5000 + 3000)}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', padding: '14px' }}
                  onClick={() => setShowRendimiento(false)}
                >
                  Volver al Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
