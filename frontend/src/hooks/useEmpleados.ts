import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmpleado,
  fetchEmpleados,
  fetchHoras,
  registrarHoras,
  updateEmpleado,
} from '../services/empleados';
import type { EmpleadoInput, HorasInput } from '../types/empleado';

const EMPLEADOS_KEY = ['empleados'];

export function useEmpleados() {
  return useQuery({ queryKey: EMPLEADOS_KEY, queryFn: fetchEmpleados });
}

export function useCreateEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmpleadoInput) => createEmpleado(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMPLEADOS_KEY }),
  });
}

export function useUpdateEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmpleadoInput> }) => updateEmpleado(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMPLEADOS_KEY }),
  });
}

export function useHoras(empleadoId: string, mes: number, anio: number) {
  return useQuery({
    queryKey: [...EMPLEADOS_KEY, empleadoId, 'horas', mes, anio],
    queryFn: () => fetchHoras(empleadoId, mes, anio),
    enabled: !!empleadoId,
  });
}

export function useRegistrarHoras() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ empleadoId, input }: { empleadoId: string; input: HorasInput }) =>
      registrarHoras(empleadoId, input),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: [...EMPLEADOS_KEY, variables.empleadoId, 'horas'] }),
  });
}
