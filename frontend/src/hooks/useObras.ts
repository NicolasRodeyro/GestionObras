import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createObra, deleteObra, fetchObra, fetchObras, updateObra } from '../services/obras';
import type { ObraInput } from '../types/obra';

const OBRAS_KEY = ['obras'];

export function useObras() {
  return useQuery({ queryKey: OBRAS_KEY, queryFn: fetchObras });
}

export function useObra(id: string) {
  return useQuery({ queryKey: [...OBRAS_KEY, id], queryFn: () => fetchObra(id), enabled: !!id });
}

export function useCreateObra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ObraInput) => createObra(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OBRAS_KEY }),
  });
}

export function useUpdateObra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ObraInput> }) => updateObra(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OBRAS_KEY }),
  });
}

export function useDeleteObra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteObra(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OBRAS_KEY }),
  });
}
