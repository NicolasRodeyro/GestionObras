import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGasto, deleteGasto, fetchGastos, fetchResumen, updateGasto } from '../services/gastos';
import type { GastoFilters, GastoInput } from '../types/gasto';

const GASTOS_KEY = ['gastos'];

export function useGastos(filters: GastoFilters) {
  return useQuery({ queryKey: [...GASTOS_KEY, filters], queryFn: () => fetchGastos(filters) });
}

export function useResumenGastos(filters: Omit<GastoFilters, 'categoria'>) {
  return useQuery({ queryKey: [...GASTOS_KEY, 'resumen', filters], queryFn: () => fetchResumen(filters) });
}

export function useCreateGasto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GastoInput) => createGasto(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GASTOS_KEY }),
  });
}

export function useUpdateGasto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<GastoInput> }) => updateGasto(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GASTOS_KEY }),
  });
}

export function useDeleteGasto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGasto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GASTOS_KEY }),
  });
}
