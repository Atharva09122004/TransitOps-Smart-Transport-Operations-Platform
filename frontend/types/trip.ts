export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";

export interface Trip {
  id: number;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId?: number | null;
  driverId?: number | null;
  cargoWeightKg: number;
  plannedDistanceKm?: number | null;
  actualDistanceKm?: number | null;
  status: TripStatus;
  etaMinutes?: number | null;
  dispatchedAt?: string | null;
  completedAt?: string | null;
  cancelledReason?: string | null;
  remarks?: string | null;
  createdById?: number | null;
  createdAt: string;
  updatedAt: string;
  
  vehicle?: {
    id: number;
    regNo: string;
    modelName: string;
  } | null;
  driver?: {
    id: number;
    name: string;
  } | null;
  fuelLogs?: Array<{
    id: number;
    liters: number;
    fuelCost: number;
    logDate: string;
  }>;
  expenses?: Array<{
    id: number;
    tollCost: number;
    otherCost: number;
    status: string;
  }>;
  revenue?: {
    id: number;
    revenue: number;
  } | null;
}
