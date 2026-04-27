import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Tracking, TrackingStatus } from '@/src/types';
import { toast } from 'sonner';

export function useTrackingLocations() {
  return useQuery({
    queryKey: ['tracking-locations'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Record<TrackingStatus, string>>>('/api/tracking/locations');
      return res.data.data;
    },
    staleTime: Infinity,
  });
}

export function useBaggageHistory(baggageId: string) {
  return useQuery({
    queryKey: ['tracking', 'baggage', baggageId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Tracking[]>>(`/api/tracking/baggage/${baggageId}`);
      return response.data.data;
    },
    enabled: !!baggageId,
  });
}

export function useTracking() {
  const queryClient = useQueryClient();

  const createCheckpoint = useMutation({
    mutationFn: async (data: Omit<Tracking, 'id' | 'timestamp'>) => {
      const response = await apiClient.post<ApiResponse<Tracking>>('/api/tracking', data);
      return response.data;
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['tracking', 'baggage', variables.baggageId] });
      queryClient.invalidateQueries({ queryKey: ['baggage'] });
      toast.success(res.responseMessage || 'Checkpoint added successfully');
    },
  });

  return { createCheckpoint };
}
