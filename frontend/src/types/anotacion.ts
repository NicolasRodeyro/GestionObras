export type Prioridad = 'baja' | 'media' | 'alta';

export interface Anotacion {
  id: string;
  obraId: string;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  completada: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnotacionInput {
  titulo: string;
  descripcion?: string;
  prioridad?: Prioridad;
}

export interface UpdateAnotacionInput {
  titulo?: string;
  descripcion?: string;
  prioridad?: Prioridad;
  completada?: boolean;
}
