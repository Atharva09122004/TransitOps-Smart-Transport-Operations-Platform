import api from "@/lib/axios";
import { AnalyticsReport } from "@/types/report";

export const getAnalyticsReport = (): Promise<AnalyticsReport> => {
  return api.get("/reports").then((res) => res.data.data);
};
