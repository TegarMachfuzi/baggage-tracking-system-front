export type UserRole = 'USER' | 'STAFF' | 'ADMIN';

export interface User {
  token: string;
  type: string;
  username: string;
  email: string;
  role: UserRole;
  passengerId?: string;
}

export interface ApiResponse<T> {
  responseCode: string;
  responseMessage: string;
  data: T;
}

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
}

export type BaggageStatus = 
  | 'CHECKED_IN' 
  | 'IN_TRANSIT' 
  | 'LOADING_TO_AIRCRAFT' 
  | 'ARRIVED' 
  | 'LOST' 
  | 'DAMAGED';

export interface Baggage {
  id: string;
  barcode: string;
  passengerId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  status: BaggageStatus;
  lastUpdated: string;
}

export type TrackingStatus = 
  | 'CHECKED_IN' 
  | 'SECURITY_CHECK' 
  | 'LOADING_TO_AIRCRAFT' 
  | 'IN_TRANSIT' 
  | 'ARRIVED' 
  | 'CUSTOMS_CHECK' 
  | 'READY_FOR_PICKUP';

export interface Tracking {
  id: string;
  baggageId: string;
  location: string;
  status: TrackingStatus;
  timestamp: string;
  remarks: string;
}

export type ClaimType = 'LOST' | 'DAMAGED' | 'DELAYED';
export type ClaimStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Claim {
  id: string;
  baggageId: string;
  passengerId: string;
  claimType: ClaimType;
  status: ClaimStatus;
  description: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface DashboardStats {
  totalPassengers: number;
  totalBaggage: number;
  activeClaims: number;
  recentTrackingEvents: number;
  statusDistribution: { name: string; value: number }[];
  recentActivity: {
    baggage: Baggage[];
    claims: Claim[];
  };
}
