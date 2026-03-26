import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Claim, ClaimStatus, ClaimType } from '@/src/types';
import { toast } from 'sonner';

export function useClaims() {
  const queryClient = useQueryClient();

  const claimsQuery = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Claim[]>>('/api/claim');
      return response.data.data;
    },
  });

  const createClaim = useMutation({
    mutationFn: async (data: Pick<Claim, 'baggageId' | 'passengerId' | 'claimType' | 'description'>) => {
      const response = await apiClient.post<ApiResponse<Claim>>('/api/claim', data);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success(res.responseMessage || 'Claim submitted successfully');
    },
  });

  const updateClaimStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ClaimStatus }) => {
      const response = await apiClient.put<ApiResponse<Claim>>(`/api/claim/${id}/status?status=${status}`);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success(res.responseMessage || 'Claim status updated successfully');
    },
  });

  const deleteClaim = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<any>>(`/api/claim/${id}`);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success(res.responseMessage || 'Claim deleted successfully');
    },
  });

  return {
    claimsQuery,
    createClaim,
    updateClaimStatus,
    deleteClaim,
  };
}
