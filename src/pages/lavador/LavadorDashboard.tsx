import { useState, useEffect } from 'react';
import { useApp } from '../../store';
import { CheckCircle2, PlayCircle, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function LavadorDashboard() {
  const { authUser, citas, actualizarCita } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Filtrar citas del día actual (idealmente, pero mostraremos todas las pendientes y en proceso)
  const citasPendientes = citas.filter(c => c.estado === 'pendiente');
  const misCitas = citas.filter(c => c.estado === 'en_proceso' && c.lavadorId === authUser?.id);
  const citasListas = citas.filter(c => c.estado === 'listo_entrega' && c.lavadorId === authUser?.id);

  const tomarCita = (id: string) => {
    const cita = citas.find(c => c.id === id);
    if (cita) {
      actualizarCita({
        ...cita,
        estado: 'en_proceso',
        lavadorId: authUser?.id,
        lavadorNombre: authUser?.nombre
      });
    }
  };

  const terminarCita = (id: string) => {
    const cita = citas.find(c => c.id === id);
    if (cita) {
      actualizarCita({
        ...cita,
        estado: 'listo_entrega'
      });
    }
  };

  const entregarVehiculo = (id: string) => {
    const cita = citas.find(c => c.id === id);
    if (cita) {
      actualizarCita({
        ...cita,
        estado: 'completada',
        recogido: true
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
        (error: any) => {
          // Ignore scanning errors (happens when no QR found yet)
        }
      );
    }
    
    return () => {
      if (scanner) {
        scanner.clear().catch((e: any) => console.error(e));
      }
    };
  }, [scannerOpen]);

  // Si el texto escaneado es el ID de una cita, buscarla
  const citaEscaneada = scanResult ? citas.find(c => c.id === scanResult || c.codigoQR === scanResult) : null;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Mis Tareas ({authUser?.nombre})</h1>
        <p>Gestiona tus lavados y entregas</p>
      </header>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Columna Pendientes */}
        <div style={{ backgroundColor: 'var(--white)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            Por Atender ({citasPendientes.length})
          </h2>
          {citasPendientes.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No hay citas pendientes.</p>
          ) : (
            citasPendientes.map(cita => (
              <div key={cita.id} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4>{cita.paqueteNombre}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>🚗 {cita.cliente.vehiculo.marca} {cita.cliente.vehiculo.modelo}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--gray)' }}>⏰ {cita.hora}</p>
                <button 
                  onClick={() => tomarCita(cita.id)}
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb' }}
                >
                  <PlayCircle size={18} /> Tomar Lavado
                </button>
              </div>
            ))
          )}
        </div>

        {/* Columna En Proceso */}
        <div style={{ backgroundColor: 'var(--white)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8, color: '#d97706' }}>
            En Proceso ({misCitas.length})
          </h2>
          {misCitas.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No tienes lavados activos.</p>
          ) : (
            misCitas.map(cita => (
              <div key={cita.id} style={{ border: '1px solid #fde68a', backgroundColor: '#fffbeb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4>{cita.paqueteNombre}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>🚗 {cita.cliente.vehiculo.marca} {cita.cliente.vehiculo.modelo}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--gray)' }}>⏰ {cita.hora}</p>
                <button 
                  onClick={() => terminarCita(cita.id)}
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, backgroundColor: '#d97706' }}
                >
                  <CheckCircle2 size={18} /> Marcar Listo
                </button>
              </div>
            ))
          )}
        </div>

        {/* Columna Listos para entrega */}
        <div style={{ backgroundColor: 'var(--white)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8, color: 'var(--success)' }}>
            Listos para Entrega ({citasListas.length})
          </h2>
          {citasListas.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No hay vehículos esperando.</p>
          ) : (
            citasListas.map(cita => (
              <div key={cita.id} style={{ border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <h4>{cita.paqueteNombre}</h4>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>🚗 {cita.cliente.vehiculo.marca} {cita.cliente.vehiculo.modelo}</p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--gray)' }}>Dueño: {cita.cliente.nombre}</p>
                
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

      {/* Modal del Lector QR */}
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
                {citaEscaneada ? (
                  <div style={{ marginTop: 16, textAlign: 'left', border: '1px solid #e2e8f0', padding: 16, borderRadius: 8 }}>
                    <p><strong>Cita ID:</strong> {citaEscaneada.id}</p>
                    <p><strong>Cliente:</strong> {citaEscaneada.cliente.nombre}</p>
                    <p><strong>Vehículo:</strong> {citaEscaneada.cliente.vehiculo.marca} {citaEscaneada.cliente.vehiculo.modelo}</p>
                    <p><strong>Placa:</strong> {citaEscaneada.cliente.vehiculo.placa}</p>
                    
                    {citaEscaneada.estado === 'listo_entrega' ? (
                      <button 
                        onClick={() => entregarVehiculo(citaEscaneada.id)}
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: 16, backgroundColor: 'var(--success)' }}
                      >
                        Confirmar Entrega
                      </button>
                    ) : (
                      <p style={{ color: 'var(--red)', marginTop: 16, fontWeight: 'bold' }}>Esta cita no está marcada como "Lista para entrega" ({citaEscaneada.estado}).</p>
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
