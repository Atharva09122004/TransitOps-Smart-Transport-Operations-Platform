"use client";

import * as React from "react";
import { Expense } from "@/types/expense";
import { ShieldAlert } from "lucide-react";

interface ExpenseTableProps {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: Expense["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Approved
          </span>
        );
      case "PAID":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Paid
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-500">
            Unknown
          </span>
        );
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No expenses found</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
            Start by adding expenses for trips. This tracks toll and miscellaneous costs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-555 font-medium">
              <th className="p-4">Trip Code</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Toll Cost</th>
              <th className="p-4">Other Cost</th>
              <th className="p-4">Maintenance Cleared</th>
              <th className="p-4">Logged Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {expenses.map((expense) => (
              <tr key={expense.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 font-mono text-[10px] font-semibold">
                    {expense.trip?.tripCode || `ID: ${expense.tripId}`}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {expense.vehicle?.regNo || `ID: ${expense.vehicleId}`}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {expense.vehicle?.modelName || "Unknown Vehicle"}
                  </div>
                </td>
                <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(expense.tollCost)}
                </td>
                <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(expense.otherCost)}
                </td>
                <td className="p-4">
                  {expense.maintenanceCleared ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                      Cleared
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-semibold">
                      Not Cleared
                    </span>
                  )}
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400">
                  {formatDate(expense.createdAt)}
                </td>
                <td className="p-4">{getStatusBadge(expense.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
