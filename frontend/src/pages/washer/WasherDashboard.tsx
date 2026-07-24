import { useState, useEffect } from 'react';
import { useApp } from '../../store';
import { CheckCircle2, PlayCircle, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function WasherDashboard() {
  const { authUser, appointments, updateAppointment } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Ideally today's appointments only; for now every pending / in-progress one
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const myAppointments = appointments.filter(a => a.status === 'in_progress' && a.washerId === authUser?._id);
  const readyAppointments = appointments.filter(a => a.status === 'ready_for_pickup' && a.washerId === authUser?._id);

  const takeAppointment = (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      updateAppointment({
        ...appointment,
        status: 'in_progress',
        washerId: authUser?._id,
        washerName: authUser?.name
      });
    }
  };

  const finishAppointment = (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      updateAppointment({
        ...appointment,
        status: 'ready_for_pickup'
      });
    }
  };

  const deliverVehicle = (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      updateAppointment({
        ...appointment,
        status: 'completed',
        pickedUp: true
      });
      setScanResult(null);
      setScannerOpen(false);
    }
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scannerOpen) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText: string) => {
          setScanResult(decodedText);
          // Auto close scanner on success
          scanner?.clear();
        },
        () => {
          // Ignore scanning errors (happens when no QR found yet)
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((e: unknown) => console.error(e));
      }
    };
  }, [scannerOpen]);

  // If the scanned text is an appointment id, look it up
  const scannedAppointment = scanResult ? appointments.find(a => a.id === scanResult || a.qrCode === scanResult) : null;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Mis Tareas ({authUser?.name})</h1>
        <p>Gestiona tus lavados y entregas</p>
      </header>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Pending column */}
        <div style={{ backgroundColor: 'var(--white)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            Por Atender ({pendingAppointments.length})
          </h2>
          {pendingAppointments.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No hay citas pendientes.</p>
          ) : (
            pendingAppointments.map(appointment => (
              <div key={appointment.id} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4>{appointment.packageName}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>🚗 {appointment.customer.vehicle.make} {appointment.customer.vehicle.model}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--gray)' }}>⏰ {appointment.time}</p>
                <button
                  onClick={() => takeAppointment(appointment.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb' }}
                >
                  <PlayCircle size={18} /> Tomar Lavado
                </button>
              </div>
            ))
          )}
        </div>

        {/* In-progress column */}
        <div style={{ backgroundColor: 'var(--white)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8, color: '#d97706' }}>
            En Proceso ({myAppointments.length})
          </h2>
          {myAppointments.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No tienes lavados activos.</p>
          ) : (
            myAppointments.map(appointment => (
              <div key={appointment.id} style={{ border: '1px solid #fde68a', backgroundColor: '#fffbeb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4>{appointment.packageName}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>🚗 {appointment.customer.vehicle.make} {appointment.customer.vehicle.model}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--gray)' }}>⏰ {appointment.time}</p>
                <button
                  onClick={() => finishAppointment(appointment.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, backgroundColor: '#d97706' }}
                >
                  <CheckCircle2 size={18} /> Marcar Listo
                </button>
              </div>
            ))
          )}
        </div>

        {/* Ready-for-pickup column */}
        <div style={{ backgroundColor: 'var(--white)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8, color: 'var(--success)' }}>
            Listos para Entrega ({readyAppointments.length})
          </h2>
          {readyAppointments.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No hay vehículos esperando.</p>
          ) : (
            readyAppointments.map(appointment => (
              <div key={appointment.id} style={{ border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4>{appointment.packageName}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>🚗 {appointment.customer.vehicle.make} {appointment.customer.vehicle.model}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--gray)' }}>Dueño: {appointment.customer.name}</p>

                <button
                  onClick={() => setScannerOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, backgroundColor: 'var(--success)' }}
                >
                  <QrCode size={18} /> Validar y Entregar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR scanner modal */}
      {scannerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Escanear QR del Cliente</h2>
              <button onClick={() => { setScannerOpen(false); setScanResult(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {!scanResult ? (
              <div id="reader" style={{ width: '100%' }}></div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--success)' }}>¡Código detectado!</h3>
                {scannedAppointment ? (
                  <div style={{ marginTop: 16, textAlign: 'left', border: '1px solid #e2e8f0', padding: 16, borderRadius: 8 }}>
                    <p><strong>Cita ID:</strong> {scannedAppointment.id}</p>
                    <p><strong>Cliente:</strong> {scannedAppointment.customer.name}</p>
                    <p><strong>Vehículo:</strong> {scannedAppointment.customer.vehicle.make} {scannedAppointment.customer.vehicle.model}</p>
                    <p><strong>Placa:</strong> {scannedAppointment.customer.vehicle.plate}</p>

                    {scannedAppointment.status === 'ready_for_pickup' ? (
                      <button
                        onClick={() => deliverVehicle(scannedAppointment.id)}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 16, backgroundColor: 'var(--success)' }}
                      >
                        Confirmar Entrega
                      </button>
                    ) : (
                      <p style={{ color: 'var(--red)', marginTop: 16, fontWeight: 'bold' }}>Esta cita no está marcada como "Lista para entrega" ({scannedAppointment.status}).</p>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ color: 'var(--red)' }}>Código no válido o cita no encontrada.</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Contenido: {scanResult}</p>
                    <button onClick={() => setScanResult(null)} className="btn btn-secondary" style={{ marginTop: 16 }}>Intentar de nuevo</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
