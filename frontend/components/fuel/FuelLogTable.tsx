"use client";

import * as React from "react";
import { FuelLog } from "@/types/fuel";
import { ShieldAlert } from "lucide-react";

interface FuelLogTableProps {
  logs: FuelLog[];
}

export default function FuelLogTable({ logs }: FuelLogTableProps) {
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

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No fuel logs found</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
            Start by logging a vehicle refueling entry. This updates the vehicle's mileage odometer records.
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
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-550 font-medium">
              <th className="p-4">Vehicle</th>
              <th className="p-4">Log Date</th>
              <th className="p-4">Odometer (km)</th>
              <th className="p-4">Fuel Quantity</th>
              <th className="p-4">Total Cost</th>
              <th className="p-4">Trip Code</th>
              <th className="p-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {logs.map((log) => (
              <tr key={log.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {log.vehicle?.regNo || `ID: ${log.vehicleId}`}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-sans">
                    {log.vehicle?.modelName || "Unknown Vehicle"}
                  </div>
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400">
                  {formatDate(log.logDate)}
                </td>
                <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400">
                  {log.odometerKm.toLocaleString()} km
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">
                  {log.liters.toLocaleString()} Liters
                </td>
                <td className="p-4 font-mono text-zinc-900 dark:text-zinc-50 font-semibold">
                  {formatCurrency(log.fuelCost)}
                </td>
                <td className="p-4">
                  {log.trip?.tripCode ? (
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 font-mono text-[10px] font-semibold">
                      {log.trip.tripCode}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="p-4 text-zinc-400 max-w-xs truncate" title={log.remarks || ""}>
                  {log.remarks || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
