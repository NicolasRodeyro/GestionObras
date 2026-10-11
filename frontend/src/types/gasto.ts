export type CategoriaGasto = 'materiales' | 'mano_obra' | 'equipos' | 'servicios' | 'otros';

export interface Gasto {
  id: string;
  obraId: string;
  monto: number;
  categoria: CategoriaGasto;
  detalle: string | null;
  fecha: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GastoInput {
  obraId: string;
  monto: number;
  categoria: CategoriaGasto;
  detalle?: string;
  fecha: string;
}

export interface GastoFilters {
  obraId?: string;
  categoria?: CategoriaGasto;
  desde?: string;
  hasta?: string;
}
