import api from "@/lib/axios";

export interface SystemSettings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

export interface RBACRole {
  role: string;
  fleet: boolean | "view";
  drivers: boolean | "view";
  trips: boolean | "view";
  fuelExp: boolean | "view";
  analytics: boolean | "view";
}

export interface SettingsData {
  general: SystemSettings;
  rbac: RBACRole[];
}

export const getSettings = (): Promise<SettingsData> => {
  return api.get("/settings").then((res) => res.data.data);
};

export const updateSettings = (data: Partial<SystemSettings>): Promise<SettingsData> => {
  return api.put("/settings", data).then((res) => res.data.data);
};
