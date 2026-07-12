import api from "@/lib/axios";

export interface DispatcherRecentTrip {
  id: number;
  tripCode: string;
  source: string;
  destination: string;
  status: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  vehicle: { regNo: string } | null;
  driver: { name: string } | null;
}

/** Canonical fleet metrics — same field names regardless of role. */
export interface SharedDashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  vehiclesOnTrip: number;
  vehiclesInShop: number;
  totalDrivers: number;
  availableDrivers: number;
  driversOnTrip: number;
  totalTrips: number;
  draftTrips: number;
  dispatchedTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  fuelCost: number;
  maintenanceCost: number;
  operationalCost: number;
  revenue: number;
  fleetUtilization: number;
  roi: number;
}

export interface DashboardData extends SharedDashboardMetrics {
  completedToday?: number;
  recentTrips?: DispatcherRecentTrip[];
  maintenanceCount?: number;
  totalExpenses?: number;
  maintenanceRecords?: number;
  upcomingMaintenance?: number;
  safetyIncidents?: number;
  driverSafetyScores?: number;
  expenseBreakdown?: { tollCost: number; otherCost: number };
  monthlyCostSummary?: Array<{
    month: string;
    fuelCost: number;
    maintenanceCost: number;
    expenseCost: number;
    totalCost: number;
  }>;
}

function normalizeSharedMetrics(data: Record<string, unknown>): SharedDashboardMetrics {
  const fuelCost = Number(data.fuelCost ?? data.fuelExpenses ?? 0);
  const maintenanceCost = Number(data.maintenanceCost ?? 0);
  const operationalCost = Number(data.operationalCost ?? fuelCost + maintenanceCost);

  return {
    totalVehicles: Number(data.totalVehicles ?? 0),
    availableVehicles: Number(data.availableVehicles ?? 0),
    vehiclesOnTrip: Number(data.vehiclesOnTrip ?? 0),
    vehiclesInShop: Number(data.vehiclesInShop ?? 0),
    totalDrivers: Number(data.totalDrivers ?? 0),
    availableDrivers: Number(data.availableDrivers ?? 0),
    driversOnTrip: Number(data.driversOnTrip ?? 0),
    totalTrips: Number(data.totalTrips ?? 0),
    draftTrips: Number(data.draftTrips ?? 0),
    dispatchedTrips: Number(data.dispatchedTrips ?? 0),
    completedTrips: Number(data.completedTrips ?? 0),
    cancelledTrips: Number(data.cancelledTrips ?? 0),
    fuelCost,
    maintenanceCost,
    operationalCost,
    revenue: Number(data.revenue ?? 0),
    fleetUtilization: Number(data.fleetUtilization ?? 0),
    roi: Number(data.roi ?? 0),
  };
}

export const getDashboardData = (): Promise<DashboardData> => {
  return api.get("/dashboard").then((res) => {
    const data = (res.data?.data || {}) as Record<string, unknown>;
    const shared = normalizeSharedMetrics(data);

    return {
      ...shared,
      completedToday: data.completedToday !== undefined ? Number(data.completedToday) : undefined,
      recentTrips: Array.isArray(data.recentTrips) ? data.recentTrips : undefined,
      maintenanceCount: data.maintenanceCount !== undefined ? Number(data.maintenanceCount) : undefined,
      totalExpenses: data.totalExpenses !== undefined ? Number(data.totalExpenses) : undefined,
      maintenanceRecords: data.maintenanceRecords !== undefined ? Number(data.maintenanceRecords) : undefined,
      upcomingMaintenance: data.upcomingMaintenance !== undefined ? Number(data.upcomingMaintenance) : undefined,
      safetyIncidents: data.safetyIncidents !== undefined ? Number(data.safetyIncidents) : undefined,
      driverSafetyScores: data.driverSafetyScores !== undefined ? Number(data.driverSafetyScores) : undefined,
      expenseBreakdown: data.expenseBreakdown as DashboardData["expenseBreakdown"],
      monthlyCostSummary: data.monthlyCostSummary as DashboardData["monthlyCostSummary"],
    };
  });
};

/** @deprecated Use getDashboardData — kept for any legacy imports */
export type DashboardStats = SharedDashboardMetrics & {
  activeVehicles: number;
  activeTrips: number;
  driversAvailable: number;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const data = await getDashboardData();
  return {
    ...data,
    activeVehicles: data.totalVehicles,
    activeTrips: data.dispatchedTrips,
    driversAvailable: data.availableDrivers,
  };
};

export type DispatcherDashboardStats = DashboardData;

export const getDispatcherDashboardStats = getDashboardData;
