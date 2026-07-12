import api from "@/lib/axios";

export interface DashboardStats {
  activeVehicles: number;
  vehiclesInShop: number;
  activeTrips: number;
  driversAvailable: number;
  fleetUtilization: number;
  fuelCost: number;
  maintenanceCost: number;
}

export const getDashboardStats = (): Promise<DashboardStats> => {
  return api.get("/dashboard").then((res) => res.data);
};
