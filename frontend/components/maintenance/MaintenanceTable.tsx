"use client";

import * as React from "react";
import { MaintenanceRecord } from "@/types/maintenance";
import { CheckCircle, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onComplete: (id: number) => void;
}

export default function MaintenanceTable({
  records,
  onEdit,
  onComplete
}: MaintenanceTableProps) {
  const { formatCurrency } = useSettings();

  const getStatusBadge = (status: MaintenanceRecord["status"]) => {
    switch (status) {
      case "IN_SHOP":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            In Shop
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Completed
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

  // Dynamic currency logic loaded from hook

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No maintenance records found</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
            Start by registering a vehicle maintenance job. This updates the vehicle's status to In Shop automatically.
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
              <th className="p-4">Service Type</th>
              <th className="p-4">Service Date</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {records.map((record) => (
              <tr key={record.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {record.vehicle?.regNo || `ID: ${record.vehicleId}`}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {record.vehicle?.modelName || "Unknown Vehicle"}
                  </div>
                </td>
                <td className="p-4 font-medium text-zinc-900 dark:text-zinc-50">
                  {record.serviceType}
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400">
                  {formatDate(record.serviceDate)}
                </td>
                <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(record.cost)}
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400 max-w-xs truncate" title={record.notes || ""}>
                  {record.notes || "—"}
                </td>
                <td className="p-4">{getStatusBadge(record.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {record.status === "IN_SHOP" && (
                      <>
                        <button
                          onClick={() => onComplete(record.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all font-medium text-[10px]"
                          title="Complete Service"
                        >
                          <CheckCircle className="size-3" />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => onEdit(record)}
                          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                      </>
                    )}
                    {record.status === "COMPLETED" && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Done: {record.completedAt ? formatDate(record.completedAt) : "—"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
