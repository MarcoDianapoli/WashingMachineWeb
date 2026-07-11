import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import type { PaqueteConTamano } from '../types';

const TAMANO_LABEL: Record<string, string> = {
  chico: '🚗 Para autos chicos (sedans, hatchbacks)',
  mediano: '🚙 Para SUVs y crossovers',
  grande: '🛻 Para camionetas y vans',
  moto: '🏍️ Para motocicletas',
  trailer: '🚛 Para trailers y remolques',
};

const TAMANO_NOMBRE: Record<string, string> = {
  chico: 'S — Chico',
  mediano: 'M — Mediano',
  grande: 'L — Grande',
  moto: '🏍️ Moto',
  trailer: '🚛 Trailer',
};

export default function Paquetes() {
  const navigate = useNavigate();
  const { tamanoVehiculo, vehicleTypeLabel, paquetes, cliente } = useApp();
  const [detallePaquete, setDetallePaquete] = useState<PaqueteConTamano | null>(null);

  const crearCita = () => {
    if (!detallePaquete) return;
    if (!cliente) {
      navigate('/perfil');
      return;
    }
    navigate(`/horarios?paqueteId=${detallePaquete.id}`);
  };

  const badgeContent = (tamano: string) => {
    if (tamano === 'moto') return '🏍️';
    if (tamano === 'trailer') return '🚛';
    if (tamano === 'chico') return 'S';
    if (tamano === 'mediano') return 'M';
    return 'L';
  };

  return (
    <div className="page">
      <h1 className="page-title">Selecciona un paquete</h1>

      <div className="paquetes-hint">
        <div className="paquetes-hint-title">{TAMANO_LABEL[tamanoVehiculo]}</div>
        {vehicleTypeLabel && <div className="paquetes-hint-sub">Tipo detectado: {vehicleTypeLabel}</div>}
        <div style={{ fontSize: 12, color: '#fca5a5', marginTop: 4 }}>
          Configura o cambia tu vehículo en la sección Perfil
        </div>
      </div>

      <div className="paquetes-grid">
        {paquetes.map((p, i) => (
          <div className="paquete-card" key={p.id} onClick={() => setDetallePaquete(p)}>
            <div className="paquete-badge">{badgeContent(p.tamano)}</div>
            <div className="paquete-info">
              <div className="paquete-name">{p.nombre}</div>
              <div className="paquete-detail">{p.duracion} • {p.precio}</div>
            </div>
            <span className="paquete-arrow">›</span>
          </div>
        ))}
      </div>

      <div className="footer-fixed">
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/mis-citas')}>
          ← Volver a Mis Citas
        </button>
      </div>

      {detallePaquete && (
        <div className="modal-overlay" onClick={() => setDetallePaquete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="badge" style={{ background: 'var(--light-red)', color: 'var(--dark-red)' }}>
                {TAMANO_NOMBRE[detallePaquete.tamano]}
              </span>
              <button className="modal-close" onClick={() => setDetallePaquete(null)}>Cerrar</button>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>{detallePaquete.nombre}</h2>

            <div className="detail-row">
              <span className="detail-label">Duración</span>
              <span className="detail-value">{detallePaquete.duracion}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Precio</span>
              <span className="detail-price">{detallePaquete.precio}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tamaño</span>
              <span className="detail-value">{TAMANO_NOMBRE[detallePaquete.tamano]}</span>
            </div>

            <div style={{ marginTop: 20, marginBottom: 24 }}>
              <div className="detail-label" style={{ marginBottom: 6 }}>Descripción</div>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 22 }}>
                Lavado profesional para vehículos tamaño {detallePaquete.tamano}.
                Incluye {detallePaquete.nombre.toLowerCase()} con los mejores productos
                para el cuidado de tu auto.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={crearCita}>
              Seleccionar paquete
            </button>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setDetallePaquete(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
