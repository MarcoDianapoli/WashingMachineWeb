import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { TimeSlot } from '../types';
import { useApp } from '../store';

const TIME_SLOTS: TimeSlot[] = [
  { id: '1', time: '09:00', available: true },
  { id: '2', time: '10:00', available: true },
  { id: '3', time: '11:00', available: false },
  { id: '4', time: '12:00', available: true },
  { id: '5', time: '13:00', available: false },
  { id: '6', time: '14:00', available: true },
  { id: '7', time: '15:00', available: true },
  { id: '8', time: '16:00', available: true },
  { id: '9', time: '17:00', available: false },
  { id: '10', time: '18:00', available: true },
];

const DAYS = [
  { label: 'Lun 08', value: '2026-06-08' },
  { label: 'Mar 09', value: '2026-06-09' },
  { label: 'Mié 10', value: '2026-06-10' },
  { label: 'Jue 11', value: '2026-06-11' },
  { label: 'Vie 12', value: '2026-06-12' },
];

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { packages } = useApp();
  const packageId = searchParams.get('packageId');

  const [selectedDay, setSelectedDay] = useState('2026-06-08');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const selectedPackage = packages.find((p) => p.id === packageId);

  const confirm = () => {
    if (!selectedSlotId || !packageId) return;
    const slot = TIME_SLOTS.find((s) => s.id === selectedSlotId);
    if (!slot) return;
    navigate(`/confirmar-cita?packageId=${packageId}&date=${selectedDay}&time=${slot.time}`);
  };

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">{selectedPackage?.name ?? 'Paquete'}</div>
        <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{selectedPackage?.duration} • {selectedPackage?.price}</div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Selecciona un día</h3>
      <div className="days-container">
        {DAYS.map((d) => (
          <div
            key={d.value}
            className={`day-card ${selectedDay === d.value ? 'active' : ''}`}
            onClick={() => { setSelectedDay(d.value); setSelectedSlotId(null); }}
          >
            {d.label}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>Horarios disponibles</h3>
      <div className="slots-grid">
        {TIME_SLOTS.map((s) => (
          <div
            key={s.id}
            className={`time-slot ${!s.available ? 'unavailable' : ''} ${selectedSlotId === s.id ? 'selected' : ''}`}
            onClick={() => s.available && setSelectedSlotId(s.id)}
          >
            {s.time}
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={!selectedSlotId}
        onClick={confirm}
      >
        Continuar
      </button>
    </div>
  );
}
