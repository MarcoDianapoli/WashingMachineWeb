import { useState } from 'react';
import { PAQUETES_POR_TAMANO } from '../types';
import type { PaqueteConTamano, TamanoVehiculo } from '../types';
import { CarFront, Car, Truck, Bike, CheckCircle2 } from 'lucide-react';

const TAMANO_LABEL: Record<string, string> = {
  chico: 'Autos chicos',
  mediano: 'SUVs / Crossovers',
  grande: 'Camionetas / Vans',
  moto: 'Motocicletas',
  trailer: 'Trailers',
};

const TAMANO_ICONS: Record<string, React.ReactNode> = {
  chico: <CarFront size={20} />,
  mediano: <Car size={20} />,
  grande: <Truck size={20} />,
  moto: <Bike size={20} />,
  trailer: <Truck size={20} />,
};

export default function Paquetes() {
  const [detallePaquete, setDetallePaquete] = useState<PaqueteConTamano | null>(null);
  const [activeTab, setActiveTab] = useState<TamanoVehiculo>('chico');

  const tamanos = Object.keys(PAQUETES_POR_TAMANO) as TamanoVehiculo[];

  return (
    <div className="page">
      <h1 className="page-title" style={{ textAlign: 'center' }}>Nuestros Paquetes</h1>
      <p style={{ textAlign: 'center', color: 'var(--gray)', marginBottom: 32 }}>
        Conoce nuestros precios y servicios según el tipo de tu vehículo.
      </p>

      {/* Navegación por pestañas */}
      <div className="tabs-container">
        {tamanos.map((tamano) => (
          <button
            key={tamano}
            className={`tab-btn ${activeTab === tamano ? 'active' : ''}`}
            onClick={() => setActiveTab(tamano)}
          >
            {TAMANO_ICONS[tamano]}
            {TAMANO_LABEL[tamano]}
          </button>
        ))}
      </div>

      {/* Grid de paquetes para la pestaña activa */}
      <div className="paquetes-grid">
        {PAQUETES_POR_TAMANO[activeTab].map((p) => (
          <div className="paquete-card" key={p.id} onClick={() => setDetallePaquete(p)}>
            <div className="paquete-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {TAMANO_ICONS[p.tamano]}
            </div>
            <div className="paquete-info">
              <div className="paquete-name">{p.nombre}</div>
              <div className="paquete-detail">{p.duracion} • {p.precio}</div>
            </div>
            <span className="paquete-arrow">›</span>
          </div>
        ))}
      </div>

      {/* Modal de Detalle Mejorado */}
      {detallePaquete && (
        <div className="modal-overlay" onClick={() => setDetallePaquete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
            
            {/* Header del Modal */}
            <div style={{ background: 'var(--primary)', color: 'white', padding: '32px 24px', position: 'relative' }}>
              <button 
                onClick={() => setDetallePaquete(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 14 }}
              >
                Cerrar
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {TAMANO_ICONS[detallePaquete.tamano]}
                <span style={{ fontWeight: 600, opacity: 0.9 }}>{TAMANO_LABEL[detallePaquete.tamano]}</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>{detallePaquete.nombre}</h2>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: 24 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                 <div>
                   <div style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 4 }}>Precio base</div>
                   <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--dark)' }}>{detallePaquete.precio}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 4 }}>Tiempo estimado</div>
                   <div style={{ fontSize: 18, fontWeight: '600' }}>{detallePaquete.duracion}</div>
                 </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>¿Qué incluye?</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {detallePaquete.descripcion.map((item, index) => (
                    <li key={index} style={{ display: 'flex', gap: 12, color: '#555', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px 0', fontSize: 16 }} 
                onClick={() => window.location.href = 'https://washin-machine.vercel.app/'}
              >
                ¡Quiero este paquete!
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
