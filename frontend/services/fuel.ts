import api from "@/lib/axios";
import { FuelLog } from "@/types/fuel";

export interface FuelLogInput {
  vehicleId: number;
  tripId?: number | null;
  logDate?: string;
  odometerKm: number;
  liters: number;
  fuelCost: number;
  remarks?: string;
}

export const getFuelLogs = (): Promise<{ success: boolean; data: FuelLog[] }> => {
  return api.get("/fuel").then((res) => ({
    success: res.data.success,
    data: res.data.logs,
  }));
};

export const createFuelLog = (data: FuelLogInput): Promise<{ success: boolean; data: FuelLog }> => {
  return api.post("/fuel", data).then((res) => res.data);
};
