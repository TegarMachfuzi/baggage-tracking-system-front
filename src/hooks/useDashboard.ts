import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Baggage, Claim, DashboardStats, Passenger } from '@/src/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const [passengers, baggage, claims] = await Promise.all([
        apiClient.get<ApiResponse<Passenger[]>>('/api/passengers'),
        apiClient.get<ApiResponse<Baggage[]>>('/api/baggage'),
        apiClient.get<ApiResponse<Claim[]>>('/api/claim'),
      ]);

      const baggageList: Baggage[] = baggage.data.data || [];
      const claimList: Claim[] = claims.data.data || [];

      // Count baggage per status for pie chart
      const statusMap = baggageList.reduce<Record<string, number>>((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalPassengers: passengers.data.data?.length || 0,
        totalBaggage: baggageList.length,
        activeClaims: claimList.filter((c) => c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS').length,
        recentTrackingEvents: 0,
        statusDistribution: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
        recentActivity: {
          baggage: baggageList.slice(0, 5),
          claims: claimList.slice(0, 5),
        },
      };
    },
  });
}
