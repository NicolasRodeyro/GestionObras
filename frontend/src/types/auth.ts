export type Rol = 'admin' | 'gerente' | 'empleado';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}
