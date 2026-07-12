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
  return api.get("/dashboard").then((res) => {
    const data = res.data?.data || {};
    return {
      activeVehicles: data.totalVehicles ?? 0,
      vehiclesInShop: data.vehiclesInShop ?? 0,
      activeTrips: data.dispatchedTrips ?? 0,
      driversAvailable: data.availableDrivers ?? 0,
      fleetUtilization: data.fleetUtilization ?? 0,
      fuelCost: data.fuelExpenses ?? 0,
      maintenanceCost: data.maintenanceCost ?? 0,
    };
  });
};
