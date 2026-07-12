import api from "@/lib/axios";
import { Expense } from "@/types/expense";

export interface ExpenseInput {
  tripId: number;
  vehicleId: number;
  tollCost?: number;
  otherCost?: number;
  maintenanceCleared?: boolean;
  status?: "PENDING" | "APPROVED" | "PAID";
}

export const getExpenses = (): Promise<{ success: boolean; data: Expense[] }> => {
  return api.get("/expenses").then((res) => res.data);
};

export const createExpense = (data: ExpenseInput): Promise<{ success: boolean; data: Expense }> => {
  return api.post("/expenses", data).then((res) => res.data);
};
