export interface FuelLog {
  id: number;
  vehicleId: number;
  tripId?: number | null;
  logDate: string;
  odometerKm: number;
  liters: number;
  fuelCost: number;
  remarks?: string | null;
  createdAt: string;
  vehicle?: {
    regNo: string;
    modelName: string;
  };
  trip?: {
    tripCode: string;
  } | null;
}
