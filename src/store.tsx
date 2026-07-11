import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Cliente, Cita, TamanoVehiculo, PaqueteConTamano } from './types';
import { PAQUETES_POR_TAMANO } from './types';

const STORAGE_KEY = 'autolavado_data';

interface PersistedData {
  cliente: Cliente | null;
  citas: Cita[];
  vehicleTypeLabel: string | null;
  tamanoVehiculo: TamanoVehiculo;
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
  setCliente: (c: Cliente) => void;
  citas: Cita[];
  agregarCita: (cita: Cita) => void;
  cancelarCita: (id: string) => void;
  eliminarCita: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tamanoVehiculo, setTamano] = useState<TamanoVehiculo>('mediano');
  const [vehicleTypeLabel, setVehicleTypeLabel] = useState<string | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    const d = loadData();
    if (!d) return;
    if (d.cliente) setCliente(d.cliente);
    if (d.citas) setCitas(d.citas);
    if (d.vehicleTypeLabel) setVehicleTypeLabel(d.vehicleTypeLabel);
    if (d.tamanoVehiculo) setTamano(d.tamanoVehiculo);
    loaded.current = true;
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData({ cliente, citas, vehicleTypeLabel, tamanoVehiculo });
    }, 300);
  }, [cliente, citas, vehicleTypeLabel, tamanoVehiculo]);

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
