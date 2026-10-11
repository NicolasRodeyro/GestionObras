import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAnotacion,
  deleteAnotacion,
  fetchAnotaciones,
  updateAnotacion,
} from '../services/anotaciones';
import type { AnotacionInput, UpdateAnotacionInput } from '../types/anotacion';

const ANOTACIONES_KEY = ['anotaciones'];

export function useAnotaciones(obraId: string) {
  return useQuery({
    queryKey: [...ANOTACIONES_KEY, obraId],
    queryFn: () => fetchAnotaciones(obraId),
    enabled: !!obraId,
  });
}

export function useCreateAnotacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ obraId, input }: { obraId: string; input: AnotacionInput }) =>
      createAnotacion(obraId, input),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: [...ANOTACIONES_KEY, variables.obraId] }),
  });
}

export function useUpdateAnotacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAnotacionInput }) => updateAnotacion(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ANOTACIONES_KEY }),
  });
}

export function useDeleteAnotacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnotacion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ANOTACIONES_KEY }),
  });
}
