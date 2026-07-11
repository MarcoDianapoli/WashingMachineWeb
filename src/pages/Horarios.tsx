import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Horario } from '../types';
import { useApp } from '../store';

const HORARIOS: Horario[] = [
  { id: '1', hora: '09:00', disponible: true },
  { id: '2', hora: '10:00', disponible: true },
  { id: '3', hora: '11:00', disponible: false },
  { id: '4', hora: '12:00', disponible: true },
  { id: '5', hora: '13:00', disponible: false },
  { id: '6', hora: '14:00', disponible: true },
  { id: '7', hora: '15:00', disponible: true },
  { id: '8', hora: '16:00', disponible: true },
  { id: '9', hora: '17:00', disponible: false },
  { id: '10', hora: '18:00', disponible: true },
];

const DIAS = [
  { label: 'Lun 08', value: '2026-06-08' },
  { label: 'Mar 09', value: '2026-06-09' },
  { label: 'Mié 10', value: '2026-06-10' },
  { label: 'Jue 11', value: '2026-06-11' },
  { label: 'Vie 12', value: '2026-06-12' },
];

export default function Horarios() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { paquetes } = useApp();
  const paqueteId = searchParams.get('paqueteId');

  const [diaSeleccionado, setDiaSeleccionado] = useState('2026-06-08');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null);

  const paquete = paquetes.find((p) => p.id === paqueteId);

  const confirmar = () => {
    if (!horarioSeleccionado || !paqueteId) return;
    const slot = HORARIOS.find((h) => h.id === horarioSeleccionado);
    if (!slot) return;
    navigate(`/confirmar-cita?paqueteId=${paqueteId}&fecha=${diaSeleccionado}&hora=${slot.hora}`);
  };

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">{paquete?.nombre ?? 'Paquete'}</div>
        <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{paquete?.duracion} • {paquete?.precio}</div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Selecciona un día</h3>
      <div className="dias-container">
        {DIAS.map((d) => (
          <div
            key={d.value}
            className={`dia-card ${diaSeleccionado === d.value ? 'active' : ''}`}
            onClick={() => { setDiaSeleccionado(d.value); setHorarioSeleccionado(null); }}
          >
            {d.label}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Horarios disponibles</h3>
      <div className="horarios-grid">
        {HORARIOS.map((h) => (
          <div
            key={h.id}
            className={`horario-slot ${!h.disponible ? 'unavailable' : ''} ${horarioSeleccionado === h.id ? 'selected' : ''}`}
            onClick={() => h.disponible && setHorarioSeleccionado(h.id)}
          >
            {h.hora}
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={!horarioSeleccionado}
        onClick={confirmar}
      >
        Continuar
      </button>
    </div>
  );
}
