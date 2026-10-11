import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchQuincena, marcarComoPagada } from '../services/quincenas';

const QUINCENAS_KEY = ['quincenas'];

export function useQuincena(empleadoId: string, mes: number, anio: number) {
  return useQuery({
    queryKey: [...QUINCENAS_KEY, empleadoId, mes, anio],
    queryFn: () => fetchQuincena(empleadoId, mes, anio),
    enabled: !!empleadoId,
  });
}

export function useMarcarComoPagada() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marcarComoPagada(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUINCENAS_KEY }),
  });
}
