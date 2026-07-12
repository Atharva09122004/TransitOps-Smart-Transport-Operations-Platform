import api from "@/lib/axios";
import { Trip } from "@/types/trip";

export interface CreateTripInput {
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: number;
  driverId: number;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  etaMinutes: number;
}

export interface UpdateTripInput {
  destination?: string;
  plannedDistanceKm?: number;
  etaMinutes?: number;
  cargoWeightKg?: number;
}

export const getTrips = (): Promise<{ success: boolean; data: Trip[] }> => {
  return api.get("/trips").then((res) => res.data);
};

export const getTripById = (id: number): Promise<{ success: boolean; data: Trip }> => {
  return api.get(`/trips/${id}`).then((res) => res.data);
};

export const createTrip = (data: CreateTripInput): Promise<{ success: boolean; data: Trip }> => {
  return api.post("/trips", data).then((res) => res.data);
};

export const updateTrip = (id: number, data: UpdateTripInput): Promise<{ success: boolean; data: Trip }> => {
  return api.put(`/trips/${id}`, data).then((res) => res.data);
};

export const dispatchTrip = (id: number): Promise<{ success: boolean; data: Trip }> => {
  return api.patch(`/trips/${id}/dispatch`).then((res) => res.data);
};

export const completeTrip = (id: number, actualDistanceKm: number): Promise<{ success: boolean; data: Trip }> => {
  return api.patch(`/trips/${id}/complete`, { actualDistanceKm }).then((res) => res.data);
};

export const cancelTrip = (id: number, cancelledReason: string): Promise<{ success: boolean; data: Trip }> => {
  return api.patch(`/trips/${id}/cancel`, { cancelledReason }).then((res) => res.data);
};
