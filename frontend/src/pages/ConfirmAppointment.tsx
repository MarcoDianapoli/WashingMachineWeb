import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import type { Appointment } from '../types';

export default function ConfirmAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { packages, customer, addAppointment } = useApp();

  const packageId = searchParams.get('packageId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const selectedPackage = packages.find((p) => p.id === packageId);

  const confirm = () => {
    if (!customer || !selectedPackage || !date || !time) return;

    const appointment: Appointment = {
      id: `cita-${Date.now()}`,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      date,
      time,
      customer,
      status: 'pending',
    };
    addAppointment(appointment);
    navigate('/exito');
  };

  if (!customer) {
    return (
      <div className="page">
        <h1 className="page-title">Confirmar cita</h1>
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
          <p style={{ color: '#92400e', fontWeight: 500 }}>
            Configura tus datos en Perfil antes de agendar.
          </p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/perfil')}>
          Ir a Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Confirmar cita</h1>

      <div className="card">
        <div className="card-label">Paquete seleccionado</div>
        <div className="card-title">{selectedPackage?.name}</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--red)', marginBottom: 4 }}>{selectedPackage?.price}</div>
        <div style={{ fontSize: 14, color: '#666' }}>Duración: {selectedPackage?.duration}</div>
      </div>

      <div className="card">
        <div className="card-label">Fecha y hora</div>
        <div className="card-value">{date}</div>
        <div className="card-value">{time}</div>
      </div>

      <div className="card">
        <div className="card-label">Cliente</div>
        <div className="card-value">{customer.name}</div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Teléfono</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{customer.phone}</div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Vehículo</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
          {customer.vehicle.make} {customer.vehicle.model}
        </div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Placa</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{customer.vehicle.plate || 'Sin registrar'}</div>
        <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Color</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{customer.vehicle.color || 'Sin registrar'}</div>
        {customer.pickupPerson && (
          <>
            <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />
            <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Persona que recoge</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{customer.pickupPerson}</div>
          </>
        )}
      </div>

      <div className="actions-row">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
        <button className="btn btn-primary" onClick={confirm}>Confirmar cita</button>
      </div>
    </div>
  );
}
