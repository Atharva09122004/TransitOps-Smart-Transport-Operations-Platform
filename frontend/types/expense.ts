export interface Expense {
  id: number;
  tripId: number;
  vehicleId: number;
  tollCost: number;
  otherCost: number;
  maintenanceCleared: boolean;
  status: "PENDING" | "APPROVED" | "PAID";
  createdAt: string;
  vehicle?: {
    regNo: string;
    modelName: string;
  };
  trip?: {
    tripCode: string;
  };
}
