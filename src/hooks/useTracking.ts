import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Tracking, TrackingStatus } from '@/src/types';
import { toast } from 'sonner';

export function useTracking() {
  const queryClient = useQueryClient();

  const allTrackingQuery = useQuery({
    queryKey: ['tracking'],
    queryFn: async () => {
      // Assuming there's a list endpoint for all tracking events or we fetch recent ones
      const response = await apiClient.get<ApiResponse<Tracking[]>>('/api/tracking');
      return response.data.data;
    },
  });

  const getBaggageHistory = (baggageId: string) => useQuery({
    queryKey: ['tracking', 'baggage', baggageId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Tracking[]>>(`/api/tracking/baggage/${baggageId}`);
      return response.data.data;
    },
    enabled: !!baggageId,
  });

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

  return {
    allTrackingQuery,
    getBaggageHistory,
    createCheckpoint,
  };
}
