export interface ReportSummary {
  fuelEfficiency: string;
  fleetUtilization: string;
  operationalCost: number;
  vehicleROI: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface CostliestVehicle {
  vehicleId: number;
  regNo: string;
  modelName: string;
  totalCost: number;
}

export interface AnalyticsReport {
  summary: ReportSummary;
  monthlyRevenue: MonthlyRevenue[];
  topCostliestVehicles: CostliestVehicle[];
}
