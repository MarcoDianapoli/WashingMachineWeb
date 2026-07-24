import { useState } from 'react';
import { PACKAGES_BY_SIZE } from '../types';
import type { SizedPackage, VehicleSize } from '../types';
import { CarFront, Car, Truck, Bike, CheckCircle2 } from 'lucide-react';

const SIZE_LABEL: Record<string, string> = {
  small: 'Autos chicos',
  medium: 'SUVs / Crossovers',
  large: 'Camionetas / Vans',
  motorcycle: 'Motocicletas',
  trailer: 'Trailers',
};

const SIZE_ICONS: Record<string, React.ReactNode> = {
  small: <CarFront size={20} />,
  medium: <Car size={20} />,
  large: <Truck size={20} />,
  motorcycle: <Bike size={20} />,
  trailer: <Truck size={20} />,
};

export default function Packages() {
  const [packageDetail, setPackageDetail] = useState<SizedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<VehicleSize>('small');

  const sizes = Object.keys(PACKAGES_BY_SIZE) as VehicleSize[];

  return (
    <div className="page">
      <h1 className="page-title" style={{ textAlign: 'center' }}>Nuestros Paquetes</h1>
      <p style={{ textAlign: 'center', color: 'var(--gray)', marginBottom: 32 }}>
        Conoce nuestros precios y servicios según el tipo de tu vehículo.
      </p>

      {/* Tab navigation */}
      <div className="tabs-container">
        {sizes.map((size) => (
          <button
            key={size}
            className={`tab-btn ${activeTab === size ? 'active' : ''}`}
            onClick={() => setActiveTab(size)}
          >
            {SIZE_ICONS[size]}
            {SIZE_LABEL[size]}
          </button>
        ))}
      </div>

      {/* Package grid for the active tab */}
      <div className="packages-grid">
        {PACKAGES_BY_SIZE[activeTab].map((p) => (
          <div className="package-card" key={p.id} onClick={() => setPackageDetail(p)}>
            <div className="package-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {SIZE_ICONS[p.size]}
            </div>
            <div className="package-info">
              <div className="package-name">{p.name}</div>
              <div className="package-detail">{p.duration} • {p.price}</div>
            </div>
            <span className="package-arrow">›</span>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {packageDetail && (
        <div className="modal-overlay" onClick={() => setPackageDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ background: 'var(--primary)', color: 'white', padding: '32px 24px', position: 'relative' }}>
              <button
                onClick={() => setPackageDetail(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 14 }}
              >
                Cerrar
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {SIZE_ICONS[packageDetail.size]}
                <span style={{ fontWeight: 600, opacity: 0.9 }}>{SIZE_LABEL[packageDetail.size]}</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>{packageDetail.name}</h2>
            </div>

            {/* Modal body */}
            <div style={{ padding: 24 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                 <div>
                   <div style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 4 }}>Precio base</div>
                   <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--dark)' }}>{packageDetail.price}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 4 }}>Tiempo estimado</div>
                   <div style={{ fontSize: 18, fontWeight: '600' }}>{packageDetail.duration}</div>
                 </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>¿Qué incluye?</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {packageDetail.description.map((item, index) => (
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
