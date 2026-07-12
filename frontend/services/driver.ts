import api from "@/lib/axios";
import { Driver } from "@/types/driver";

export interface DriverInput {
  name: string;
  userId?: number | null;
  licenseNo: string;
  category: "LMV" | "HMV";
  licenseExpiry: string;
  contact?: string | null;
  status?: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
  isActive?: boolean;
}

export const createDriver = (data: DriverInput) =>
  api.post("/drivers", data).then((res) => res.data);

export const getDrivers = () =>
  api.get("/drivers").then((res) => ({
    ...res.data,
    drivers: res.data.drivers ?? res.data.data ?? [],
  }));

export const getDriver = (id: number) =>
  api.get(`/drivers/${id}`).then((res) => res.data);

export const updateDriver = (id: number, data: Partial<DriverInput>) =>
  api.put(`/drivers/${id}`, data).then((res) => res.data);

export const deleteDriver = (id: number) =>
  api.delete(`/drivers/${id}`).then((res) => res.data);
