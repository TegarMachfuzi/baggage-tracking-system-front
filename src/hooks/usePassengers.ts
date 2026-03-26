import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Passenger } from '@/src/types';
import { toast } from 'sonner';

export function usePassengers() {
  const queryClient = useQueryClient();

  const passengersQuery = useQuery({
    queryKey: ['passengers'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Passenger[]>>('/api/passengers');
      return response.data.data;
    },
  });

  const createPassenger = useMutation({
    mutationFn: async (data: Omit<Passenger, 'id'>) => {
      const response = await apiClient.post<ApiResponse<Passenger>>('/api/passengers', data);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      toast.success(res.responseMessage || 'Passenger created successfully');
    },
  });

  const updatePassenger = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Passenger> }) => {
      const response = await apiClient.put<ApiResponse<Passenger>>(`/api/passengers/${id}`, data);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      toast.success(res.responseMessage || 'Passenger updated successfully');
    },
  });

  const deletePassenger = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<any>>(`/api/passengers/${id}`);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      toast.success(res.responseMessage || 'Passenger deleted successfully');
    },
  });

  return {
    passengersQuery,
    createPassenger,
    updatePassenger,
    deletePassenger,
  };
}
