"use client";

import * as React from "react";
import { Driver } from "@/types/driver";
import { Trash2, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DriverTableProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
}

export default function DriverTable({
  drivers,
  onEdit,
  onDelete
}: DriverTableProps) {
  const getStatusBadge = (status: Driver["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Available
          </span>
        );
      case "ON_TRIP":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            On Trip
          </span>
        );
      case "OFF_DUTY":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-zinc-500">
            Off Duty
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-150 text-zinc-500">
            Unknown
          </span>
        );
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400 font-semibold";
    if (score >= 70) return "text-amber-500 font-semibold";
    return "text-red-500 font-semibold";
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

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No drivers found</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
            Start by adding drivers to the system. You will be able to assign them to vehicles and log trips.
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
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium">
              <th className="p-4">Driver Name</th>
              <th className="p-4">License Info</th>
              <th className="p-4">Category</th>
              <th className="p-4">Expiry Date</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Safety Score</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {drivers.map((driver) => (
              <tr key={driver.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">{driver.name}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">ID: {driver.id}</div>
                </td>
                <td className="p-4 font-mono">{driver.licenseNo}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-[10px]">
                    {driver.category}
                  </span>
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400">{formatDate(driver.licenseExpiry)}</td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">{driver.contact || "—"}</td>
                <td className="p-4">
                  <span className={getSafetyScoreColor(driver.safetyScore)}>
                    {driver.safetyScore}%
                  </span>
                </td>
                <td className="p-4">{getStatusBadge(driver.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(driver)}
                      className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title="Edit Driver"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(driver.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/5 text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete Driver"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
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
