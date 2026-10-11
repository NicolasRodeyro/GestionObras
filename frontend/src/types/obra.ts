export type EstadoObra = 'planificada' | 'en_progreso' | 'pausada' | 'finalizada';

export interface Obra {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: EstadoObra;
  presupuesto: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObraInput {
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoObra;
  presupuesto: number;
}
