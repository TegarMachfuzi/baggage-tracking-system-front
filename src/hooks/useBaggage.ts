import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Baggage, BaggageStatus } from '@/src/types';
import { toast } from 'sonner';

export function useBaggage() {
  const queryClient = useQueryClient();

  const baggageQuery = useQuery({
    queryKey: ['baggage'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Baggage[]>>('/api/baggage');
      return response.data.data;
    },
  });

  const createBaggage = useMutation({
    mutationFn: async (data: Pick<Baggage, 'passengerId' | 'flightNumber' | 'origin' | 'destination'>) => {
      const response = await apiClient.post<ApiResponse<Baggage>>('/api/baggage', data);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['baggage'] });
      toast.success(res.responseMessage || 'Baggage created successfully');
    },
  });

  const updateBaggage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Baggage> }) => {
      const response = await apiClient.put<ApiResponse<Baggage>>(`/api/baggage/${id}`, data);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['baggage'] });
      toast.success(res.responseMessage || 'Baggage updated successfully');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BaggageStatus }) => {
      const response = await apiClient.patch<ApiResponse<Baggage>>(`/api/baggage/${id}/status?status=${status}`);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['baggage'] });
      toast.success(res.responseMessage || 'Status updated successfully');
    },
  });

  const deleteBaggage = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<any>>(`/api/baggage/${id}`);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['baggage'] });
      toast.success(res.responseMessage || 'Baggage deleted successfully');
    },
  });

  return {
    baggageQuery,
    createBaggage,
    updateBaggage,
    updateStatus,
    deleteBaggage,
  };
}
