export interface Driver {
  id: number;
  userId?: number | null;
  name: string;
  licenseNo: string;
  category: "LMV" | "HMV";
  licenseExpiry: string;
  contact?: string | null;
  isActive: boolean;
  safetyScore: number;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}
