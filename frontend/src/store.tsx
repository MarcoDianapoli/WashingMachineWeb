import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Customer, Appointment, VehicleSize, SizedPackage, Washer } from './types';
import { PACKAGES_BY_SIZE } from './types';
import { loadStoredAuth, saveStoredAuth } from './api';
import type { AuthUser, StoredAuth } from './api';

export const WASHERS_MOCK: Washer[] = [
  { id: 'l1', name: 'Carlos Rodríguez', phone: '555-1111', specialty: 'Lavado de Interiores', notes: 'Excelente trato con el cliente.' },
  { id: 'l2', name: 'Luis Morales', phone: '555-2222', specialty: 'Detallado Exterior', notes: 'Rápido y eficiente.' },
  { id: 'l3', name: 'Miguel Sánchez', phone: '555-3333', specialty: 'Lavado de Motos', notes: 'Muy detallista.' },
];

const STORAGE_KEY = 'autolavado_data';

interface PersistedData {
  customer: Customer | null;
  appointments: Appointment[];
  vehicleTypeLabel: string | null;
  vehicleSize: VehicleSize;
  washers: Washer[];
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

function vehicleTypeToSize(type: string | null): VehicleSize {
  if (!type) return 'medium';
  const t = type.toLowerCase();
  if (/motorcycle/.test(t)) return 'motorcycle';
  if (/trailer/.test(t)) return 'trailer';
  if (/sedan|hatchback|coupe|convertible|wagon/.test(t)) return 'small';
  if (/suv|crossover/.test(t)) return 'medium';
  return 'large';
}

interface AppState {
  vehicleSize: VehicleSize;
  vehicleTypeLabel: string | null;
  setVehicleType: (type: string | null) => void;
  packages: SizedPackage[];
  customer: Customer | null;
  setCustomer: (c: Customer | null) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
  deleteAppointment: (id: string) => void;
  updateAppointment: (appointment: Appointment) => void;
  washers: Washer[];
  addWasher: (washer: Washer) => void;
  editWasher: (id: string, washer: Partial<Washer>) => void;
  authUser: AuthUser | null;
  /** Stores the API session (token + user) or clears it with null. */
  setAuthSession: (auth: StoredAuth | null) => void;
}

const AppContext = createContext<AppState | null>(null);

const APPOINTMENTS_MOCK: Appointment[] = [
  {
    id: 'cita-1',
    packageId: 'm2',
    packageName: 'Paquete Completo',
    packagePrice: '$260',
    date: '2026-07-15',
    time: '10:00',
    customer: {
      name: 'Juan Pérez',
      phone: '5551234567',
      vehicle: { make: 'Toyota', model: 'Corolla', plate: 'ABC-123', color: 'Rojo', vehicleType: 'medium' },
      pickupPerson: 'Juan Pérez',
    },
    status: 'pending',
    paid: false,
    pickedUp: false
  },
  {
    id: 'cita-2',
    packageId: 'g3',
    packageName: 'Paquete Plus',
    packagePrice: '$420',
    date: '2026-07-15',
    time: '14:30',
    customer: {
      name: 'María Gómez',
      phone: '5559876543',
      vehicle: { make: 'Ford', model: 'Explorer', plate: 'XYZ-987', color: 'Blanco', vehicleType: 'large' },
      pickupPerson: 'María Gómez'
    },
    status: 'in_progress',
    washerId: 'l1',
    washerName: 'Carlos Rodríguez',
    paid: true,
    paymentMethod: 'card',
    pickedUp: false
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('medium');
  const [vehicleTypeLabel, setVehicleTypeLabel] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS_MOCK);
  const [washers, setWashers] = useState<Washer[]>(WASHERS_MOCK);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadStoredAuth()?.user ?? null);
  const loaded = useRef(false);

  const setAuthSession = (auth: StoredAuth | null) => {
    saveStoredAuth(auth);
    setAuthUser(auth?.user ?? null);
  };

  useEffect(() => {
    const d = loadData();
    if (!d) {
      loaded.current = true;
      return;
    }
    if (d.customer) setCustomer(d.customer);
    if (d.appointments && d.appointments.length > 0) {
      setAppointments(d.appointments);
    }
    if (d.washers && d.washers.length > 0) {
      setWashers(d.washers);
    }
    if (d.vehicleTypeLabel) setVehicleTypeLabel(d.vehicleTypeLabel);
    if (d.vehicleSize) setVehicleSize(d.vehicleSize);
    loaded.current = true;
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData({ customer, appointments, vehicleTypeLabel, vehicleSize, washers });
    }, 300);
  }, [customer, appointments, vehicleTypeLabel, vehicleSize, washers]);

  const setVehicleType = (type: string | null) => {
    setVehicleTypeLabel(type);
    setVehicleSize(vehicleTypeToSize(type));
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a)));
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAppointment = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const addWasher = (washer: Washer) => {
    setWashers((prev) => [...prev, washer]);
  };

  const editWasher = (id: string, updates: Partial<Washer>) => {
    setWashers((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const packages = PACKAGES_BY_SIZE[vehicleSize];

  return (
    <AppContext.Provider
      value={{
        vehicleSize,
        vehicleTypeLabel,
        setVehicleType,
        packages,
        customer,
        setCustomer,
        appointments,
        addAppointment,
        cancelAppointment,
        deleteAppointment,
        updateAppointment,
        washers,
        addWasher,
        editWasher,
        authUser,
        setAuthSession,
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
