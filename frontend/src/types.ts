export interface Vehicle {
  plate: string;
  make: string;
  model: string;
  color: string;
  year?: string;
  imageUri?: string;
  vehicleType?: string;
}

export interface Customer {
  name: string;
  phone: string;
  vehicle: Vehicle;
  pickupPerson: string;
  address?: string;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export type VehicleSize = 'small' | 'medium' | 'large' | 'motorcycle' | 'trailer';

export interface SizedPackage {
  id: string;
  name: string;
  price: string;
  duration: string;
  size: VehicleSize;
  description: string[];
}

export interface Washer {
  id: string;
  name: string;
  phone?: string;
  specialty?: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'transfer' | 'card';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  packageId: string;
  packageName?: string;
  packagePrice?: string;
  date: string;
  time: string;
  customer: Customer;
  status: AppointmentStatus;
  washerId?: string;
  washerName?: string;
  paymentMethod?: PaymentMethod;
  paid?: boolean;
  pickedUp?: boolean;
  qrCode?: string;
}

export interface WikiImage {
  id: number;
  title: string;
  url: string;
  width: number;
  height: number;
  author: string;
  license: string;
  pageUrl: string;
  attribution: string;
  dataUri?: string;
}

export interface WikiResult {
  success: boolean;
  total: number;
  images: WikiImage[];
  message?: string;
}

export interface MakeResult {
  Make_ID: number;
  Make_Name: string;
}

export interface ModelResult {
  Model_ID: number;
  Model_Name: string;
}

const basicDescription = [
  'Lavado exterior de carrocería',
  'Productos de alta calidad para proteger la pintura',
  'Atención detallada y cuidadosa'
];

const completeDescription = [
  'Lavado exterior de carrocería',
  'Aspirado profundo de interiores',
  'Limpieza de cristales y espejos',
  'Productos de alta calidad para proteger la pintura'
];

const plusDescription = [
  'Lavado exterior y aspirado profundo',
  'Aplicación de cera líquida premium',
  'Brillo para plásticos interiores y exteriores',
  'Aromatizante y detallado minucioso'
];

const motorcycleBasicDescription = [
  'Lavado detallado y desengrasado',
  'Productos seguros para el motor y componentes',
  'Secado a detalle'
];

const motorcycleCompleteDescription = [
  'Lavado detallado y desengrasado profundo',
  'Brillo para plásticos y llantas',
  'Limpieza de cadena',
  'Secado a detalle'
];

export const PACKAGES_BY_SIZE: Record<VehicleSize, SizedPackage[]> = {
  small: [
    { id: 'c1', name: 'Paquete Básico', price: '$120', duration: '20 min', size: 'small', description: basicDescription },
    { id: 'c2', name: 'Paquete Completo', price: '$200', duration: '40 min', size: 'small', description: completeDescription },
    { id: 'c3', name: 'Paquete Plus', price: '$280', duration: '1 hr', size: 'small', description: plusDescription },
  ],
  medium: [
    { id: 'm1', name: 'Paquete Básico', price: '$150', duration: '25 min', size: 'medium', description: basicDescription },
    { id: 'm2', name: 'Paquete Completo', price: '$260', duration: '50 min', size: 'medium', description: completeDescription },
    { id: 'm3', name: 'Paquete Plus', price: '$350', duration: '1.5 hrs', size: 'medium', description: plusDescription },
  ],
  large: [
    { id: 'g1', name: 'Paquete Básico', price: '$180', duration: '30 min', size: 'large', description: basicDescription },
    { id: 'g2', name: 'Paquete Completo', price: '$320', duration: '1 hr', size: 'large', description: completeDescription },
    { id: 'g3', name: 'Paquete Plus', price: '$420', duration: '2 hrs', size: 'large', description: plusDescription },
  ],
  motorcycle: [
    { id: 'mc1', name: 'Paquete Básico', price: '$80', duration: '15 min', size: 'motorcycle', description: motorcycleBasicDescription },
    { id: 'mc2', name: 'Paquete Completo', price: '$130', duration: '30 min', size: 'motorcycle', description: motorcycleCompleteDescription },
  ],
  trailer: [
    { id: 't1', name: 'Paquete Básico', price: '$250', duration: '40 min', size: 'trailer', description: basicDescription },
    { id: 't2', name: 'Paquete Completo', price: '$400', duration: '1.5 hrs', size: 'trailer', description: completeDescription },
    { id: 't3', name: 'Paquete Plus', price: '$550', duration: '2.5 hrs', size: 'trailer', description: plusDescription },
  ],
};
