export interface Vehicle {
  id: number;
  regNo: string;
  modelName: string;
  type: "VAN" | "TRUCK" | "MINI";
  capacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  createdAt: string;
  updatedAt: string;
}
