import api from "@/lib/axios";
import { Vehicle } from "@/types/vehicle";

export interface VehicleInput {
  regNo: string;
  modelName: string;
  type: "VAN" | "TRUCK" | "MINI";
  capacityKg: number;
  odometerKm?: number;
  acquisitionCost?: number;
}

export interface VehicleFilters {
  search?: string;
  type?: string;
  status?: string;
}

export const getVehicles = (filters?: VehicleFilters) => {
  return api.get("/vehicles", { params: filters }).then((res) => res.data);
};

export const getVehicle = (id: number) => {
  return api.get(`/vehicles/${id}`).then((res) => res.data);
};

export const createVehicle = (data: VehicleInput) => {
  return api.post("/vehicles", data).then((res) => res.data);
};

export const updateVehicle = (id: number, data: Partial<VehicleInput & { status: string }>) => {
  return api.put(`/vehicles/${id}`, data).then((res) => res.data);
};

export const deleteVehicle = (id: number) => {
  return api.delete(`/vehicles/${id}`).then((res) => res.data);
};
