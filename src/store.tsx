import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Cliente, Cita, TamanoVehiculo, PaqueteConTamano, Lavador } from './types';
import { PAQUETES_POR_TAMANO } from './types';

export const LAVADORES_MOCK: Lavador[] = [
  { id: 'l1', nombre: 'Carlos Rodríguez', telefono: '555-1111', especialidad: 'Lavado de Interiores', observaciones: 'Excelente trato con el cliente.' },
  { id: 'l2', nombre: 'Luis Morales', telefono: '555-2222', especialidad: 'Detallado Exterior', observaciones: 'Rápido y eficiente.' },
  { id: 'l3', nombre: 'Miguel Sánchez', telefono: '555-3333', especialidad: 'Lavado de Motos', observaciones: 'Muy detallista.' },
];

const STORAGE_KEY = 'autolavado_data';

interface PersistedData {
  cliente: Cliente | null;
  citas: Cita[];
  vehicleTypeLabel: string | null;
  tamanoVehiculo: TamanoVehiculo;
  lavadores: Lavador[];
}

function loadData(): Partial<PersistedData> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveData(data: PersistedData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function vehicleTypeToTamano(type: string | null): TamanoVehiculo {
  if (!type) return 'mediano';
  const t = type.toLowerCase();
  if (/motorcycle/.test(t)) return 'moto';
  if (/trailer/.test(t)) return 'trailer';
  if (/sedan|hatchback|coupe|convertible|wagon/.test(t)) return 'chico';
  if (/suv|crossover/.test(t)) return 'mediano';
  return 'grande';
}

interface AppState {
  tamanoVehiculo: TamanoVehiculo;
  vehicleTypeLabel: string | null;
  setTamanoVehiculo: (type: string | null) => void;
  paquetes: PaqueteConTamano[];
  cliente: Cliente | null;
  setCliente: (c: Cliente | null) => void;
  citas: Cita[];
  agregarCita: (cita: Cita) => void;
  cancelarCita: (id: string) => void;
  eliminarCita: (id: string) => void;
  actualizarCita: (cita: Cita) => void;
  lavadores: Lavador[];
  agregarLavador: (lavador: Lavador) => void;
  editarLavador: (id: string, lavador: Partial<Lavador>) => void;
  authUser: any;
  setAuthUser: (user: any) => void;
}

const AppContext = createContext<AppState | null>(null);

const CITAS_MOCK: Cita[] = [
  {
    id: 'cita-1',
    paqueteId: 'm2',
    paqueteNombre: 'Paquete Completo',
    paquetePrecio: '$260',
    fecha: '2026-07-15',
    hora: '10:00',
    cliente: {
      nombre: 'Juan Pérez',
      telefono: '5551234567',
      vehiculo: { marca: 'Toyota', modelo: 'Corolla', placa: 'ABC-123', color: 'Rojo', tipoVehiculo: 'mediano' },
      personaRecoge: 'Juan Pérez',
    },
    estado: 'pendiente',
    pagado: false,
    recogido: false
  },
  {
    id: 'cita-2',
    paqueteId: 'g3',
    paqueteNombre: 'Paquete Plus',
    paquetePrecio: '$420',
    fecha: '2026-07-15',
    hora: '14:30',
    cliente: {
      nombre: 'María Gómez',
      telefono: '5559876543',
      vehiculo: { marca: 'Ford', modelo: 'Explorer', placa: 'XYZ-987', color: 'Blanco', tipoVehiculo: 'grande' },
      personaRecoge: 'María Gómez'
    },
    estado: 'en_proceso',
    lavadorId: 'l1',
    lavadorNombre: 'Carlos Rodríguez',
    pagado: true,
    metodoPago: 'tarjeta',
    recogido: false
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tamanoVehiculo, setTamano] = useState<TamanoVehiculo>('mediano');
  const [vehicleTypeLabel, setVehicleTypeLabel] = useState<string | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [citas, setCitas] = useState<Cita[]>(CITAS_MOCK);
  const [lavadores, setLavadores] = useState<Lavador[]>(LAVADORES_MOCK);
  const [authUser, setAuthUser] = useState<any>(null);
  const loaded = useRef(false);

  useEffect(() => {
    const d = loadData();
    if (!d) {
      loaded.current = true;
      return;
    }
    if (d.cliente) setCliente(d.cliente);
    if (d.citas && d.citas.length > 0) {
      setCitas(d.citas);
    }
    if (d.lavadores && d.lavadores.length > 0) {
      setLavadores(d.lavadores);
    }
    if (d.vehicleTypeLabel) setVehicleTypeLabel(d.vehicleTypeLabel);
    if (d.tamanoVehiculo) setTamano(d.tamanoVehiculo);
    loaded.current = true;
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData({ cliente, citas, vehicleTypeLabel, tamanoVehiculo, lavadores });
    }, 300);
  }, [cliente, citas, vehicleTypeLabel, tamanoVehiculo, lavadores]);

  const setTamanoVehiculoFn = (type: string | null) => {
    setVehicleTypeLabel(type);
    setTamano(vehicleTypeToTamano(type));
  };

  const agregarCita = (cita: Cita) => {
    setCitas((prev) => [...prev, cita]);
  };

  const cancelarCita = (id: string) => {
    setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: 'cancelada' as const } : c)));
  };

  const eliminarCita = (id: string) => {
    setCitas((prev) => prev.filter((c) => c.id !== id));
  };

  const actualizarCita = (citaModificada: Cita) => {
    setCitas((prev) => prev.map(c => c.id === citaModificada.id ? citaModificada : c));
  };

  const agregarLavador = (lavador: Lavador) => {
    setLavadores((prev) => [...prev, lavador]);
  };

  const editarLavador = (id: string, updates: Partial<Lavador>) => {
    setLavadores((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const paquetes = PAQUETES_POR_TAMANO[tamanoVehiculo];

  return (
    <AppContext.Provider
      value={{
        tamanoVehiculo,
        vehicleTypeLabel,
        setTamanoVehiculo: setTamanoVehiculoFn,
        paquetes,
        cliente,
        setCliente,
        citas,
        agregarCita,
        cancelarCita,
        eliminarCita,
        actualizarCita,
        lavadores,
        agregarLavador,
        editarLavador,
        authUser,
        setAuthUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
