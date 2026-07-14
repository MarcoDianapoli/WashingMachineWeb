export interface Vehiculo {
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  anio?: string;
  imagenUri?: string;
  tipoVehiculo?: string;
}

export interface Cliente {
  nombre: string;
  telefono: string;
  vehiculo: Vehiculo;
  personaRecoge: string;
  direccion?: string;
  notas?: string;
}

export interface Horario {
  id: string;
  hora: string;
  disponible: boolean;
}

export type TamanoVehiculo = 'chico' | 'mediano' | 'grande' | 'moto' | 'trailer';

export interface PaqueteConTamano {
  id: string;
  nombre: string;
  precio: string;
  duracion: string;
  tamano: TamanoVehiculo;
  descripcion: string[];
}

export interface Lavador {
  id: string;
  nombre: string;
  telefono?: string;
  especialidad?: string;
  observaciones?: string;
}

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';

export interface Cita {
  id: string;
  paqueteId: string;
  paqueteNombre?: string;
  paquetePrecio?: string;
  fecha: string;
  hora: string;
  cliente: Cliente;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'listo_entrega' | 'completada' | 'cancelada';
  lavadorId?: string;
  lavadorNombre?: string;
  metodoPago?: MetodoPago;
  pagado?: boolean;
  recogido?: boolean;
  codigoQR?: string;
}

export interface WikiImage {
  id: number;
  titulo: string;
  url: string;
  ancho: number;
  alto: number;
  autor: string;
  licencia: string;
  paginaUrl: string;
  atribucion: string;
  dataUri?: string;
}

export interface WikiResult {
  exito: boolean;
  total: number;
  imagenes: WikiImage[];
  mensaje?: string;
}

export interface MakeResult {
  Make_ID: number;
  Make_Name: string;
}

export interface ModelResult {
  Model_ID: number;
  Model_Name: string;
}

const descBasico = [
  'Lavado exterior de carrocería',
  'Productos de alta calidad para proteger la pintura',
  'Atención detallada y cuidadosa'
];

const descCompleto = [
  'Lavado exterior de carrocería',
  'Aspirado profundo de interiores',
  'Limpieza de cristales y espejos',
  'Productos de alta calidad para proteger la pintura'
];

const descPlus = [
  'Lavado exterior y aspirado profundo',
  'Aplicación de cera líquida premium',
  'Brillo para plásticos interiores y exteriores',
  'Aromatizante y detallado minucioso'
];

const descMotoBasico = [
  'Lavado detallado y desengrasado',
  'Productos seguros para el motor y componentes',
  'Secado a detalle'
];

const descMotoCompleto = [
  'Lavado detallado y desengrasado profundo',
  'Brillo para plásticos y llantas',
  'Limpieza de cadena',
  'Secado a detalle'
];

export const PAQUETES_POR_TAMANO: Record<TamanoVehiculo, PaqueteConTamano[]> = {
  chico: [
    { id: 'c1', nombre: 'Paquete Básico', precio: '$120', duracion: '20 min', tamano: 'chico', descripcion: descBasico },
    { id: 'c2', nombre: 'Paquete Completo', precio: '$200', duracion: '40 min', tamano: 'chico', descripcion: descCompleto },
    { id: 'c3', nombre: 'Paquete Plus', precio: '$280', duracion: '1 hr', tamano: 'chico', descripcion: descPlus },
  ],
  mediano: [
    { id: 'm1', nombre: 'Paquete Básico', precio: '$150', duracion: '25 min', tamano: 'mediano', descripcion: descBasico },
    { id: 'm2', nombre: 'Paquete Completo', precio: '$260', duracion: '50 min', tamano: 'mediano', descripcion: descCompleto },
    { id: 'm3', nombre: 'Paquete Plus', precio: '$350', duracion: '1.5 hrs', tamano: 'mediano', descripcion: descPlus },
  ],
  grande: [
    { id: 'g1', nombre: 'Paquete Básico', precio: '$180', duracion: '30 min', tamano: 'grande', descripcion: descBasico },
    { id: 'g2', nombre: 'Paquete Completo', precio: '$320', duracion: '1 hr', tamano: 'grande', descripcion: descCompleto },
    { id: 'g3', nombre: 'Paquete Plus', precio: '$420', duracion: '2 hrs', tamano: 'grande', descripcion: descPlus },
  ],
  moto: [
    { id: 'mc1', nombre: 'Paquete Básico', precio: '$80', duracion: '15 min', tamano: 'moto', descripcion: descMotoBasico },
    { id: 'mc2', nombre: 'Paquete Completo', precio: '$130', duracion: '30 min', tamano: 'moto', descripcion: descMotoCompleto },
  ],
  trailer: [
    { id: 't1', nombre: 'Paquete Básico', precio: '$250', duracion: '40 min', tamano: 'trailer', descripcion: descBasico },
    { id: 't2', nombre: 'Paquete Completo', precio: '$400', duracion: '1.5 hrs', tamano: 'trailer', descripcion: descCompleto },
    { id: 't3', nombre: 'Paquete Plus', precio: '$550', duracion: '2.5 hrs', tamano: 'trailer', descripcion: descPlus },
  ],
};
