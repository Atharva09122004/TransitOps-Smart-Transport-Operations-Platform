export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  serviceType: string;
  cost: number;
  serviceDate: string;
  status: "IN_SHOP" | "COMPLETED";
  notes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    regNo: string;
    modelName: string;
  };
}
