import api from "@/lib/axios";
import { MaintenanceRecord } from "@/types/maintenance";

export interface MaintenanceInput {
  vehicleId: number;
  serviceType: string;
  cost?: number;
  serviceDate?: string;
  notes?: string;
}

export const getMaintenanceRecords = (): Promise<{ success: boolean; data: MaintenanceRecord[] }> => {
  return api.get("/maintenance").then((res) => ({
    success: res.data.success,
    data: res.data.records,
  }));
};

export const createMaintenance = (data: MaintenanceInput): Promise<{ success: boolean; data: MaintenanceRecord }> => {
  return api.post("/maintenance", data).then((res) => res.data);
};

export const updateMaintenance = (
  id: number,
  data: Partial<MaintenanceInput>
): Promise<{ success: boolean; data: MaintenanceRecord }> => {
  return api.put(`/maintenance/${id}`, data).then((res) => res.data);
};

export const completeMaintenance = (id: number): Promise<{ success: boolean; data: MaintenanceRecord }> => {
  return api.patch(`/maintenance/${id}/complete`).then((res) => res.data);
};
