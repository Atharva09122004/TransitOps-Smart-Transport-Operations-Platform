export interface Vehicle {
  id: number;
  regNo: string;
  modelName: string;
  type: "VAN" | "TRUCK" | "MINI";
  capacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  fuelCost?: number;
  maintenanceCost?: number;
  expensesCost?: number;
  operationalCost?: number;
  createdAt: string;
  updatedAt: string;
}
