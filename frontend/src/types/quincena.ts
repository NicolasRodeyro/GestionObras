export type EstadoQuincena = 'pendiente' | 'calculada' | 'pagada';

export interface Quincena {
  id: string;
  empleadoId: string;
  fechaInicio: string;
  fechaFin: string;
  horasTotales: number;
  tarifaPorHora: number;
  sueldoBruto: number;
  sueldoNeto: number;
  estado: EstadoQuincena;
  createdAt: string;
  updatedAt: string;
}
