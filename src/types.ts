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
}

export interface Cita {
  id: string;
  paqueteId: string;
  paqueteNombre: string;
  fecha: string;
  hora: string;
  cliente: Cliente;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
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

export const PAQUETES_POR_TAMANO: Record<TamanoVehiculo, PaqueteConTamano[]> = {
  chico: [
    { id: 'c1', nombre: 'Lavado Exterior', precio: '$120', duracion: '20 min', tamano: 'chico' },
    { id: 'c2', nombre: 'Lavado Completo', precio: '$200', duracion: '40 min', tamano: 'chico' },
    { id: 'c3', nombre: 'Lavado + Aspirado', precio: '$280', duracion: '1 hr', tamano: 'chico' },
  ],
  mediano: [
    { id: 'm1', nombre: 'Lavado Exterior', precio: '$150', duracion: '25 min', tamano: 'mediano' },
    { id: 'm2', nombre: 'Lavado Completo', precio: '$260', duracion: '50 min', tamano: 'mediano' },
    { id: 'm3', nombre: 'Lavado + Aspirado', precio: '$350', duracion: '1.5 hrs', tamano: 'mediano' },
  ],
  grande: [
    { id: 'g1', nombre: 'Lavado Exterior', precio: '$180', duracion: '30 min', tamano: 'grande' },
    { id: 'g2', nombre: 'Lavado Completo', precio: '$320', duracion: '1 hr', tamano: 'grande' },
    { id: 'g3', nombre: 'Lavado + Aspirado', precio: '$420', duracion: '2 hrs', tamano: 'grande' },
  ],
  moto: [
    { id: 'mc1', nombre: 'Lavado Básico', precio: '$80', duracion: '15 min', tamano: 'moto' },
    { id: 'mc2', nombre: 'Lavado Completo', precio: '$130', duracion: '30 min', tamano: 'moto' },
    { id: 'mc3', nombre: 'Lavado + Encerado', precio: '$200', duracion: '45 min', tamano: 'moto' },
  ],
  trailer: [
    { id: 't1', nombre: 'Lavado Exterior', precio: '$250', duracion: '40 min', tamano: 'trailer' },
    { id: 't2', nombre: 'Lavado Completo', precio: '$400', duracion: '1.5 hrs', tamano: 'trailer' },
    { id: 't3', nombre: 'Lavado + Sanitización', precio: '$550', duracion: '2.5 hrs', tamano: 'trailer' },
  ],
};
