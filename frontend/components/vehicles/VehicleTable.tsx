"use client";

import * as React from "react";
import { Vehicle } from "@/types/vehicle";
import { Trash2, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
}

export default function VehicleTable({
  vehicles,
  onEdit,
  onDelete
}: VehicleTableProps) {
  const getStatusBadge = (status: Vehicle["status"]) => {
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
      case "IN_SHOP":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            In Shop
          </span>
        );
      case "RETIRED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-zinc-500">
            Retired
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-150 text-zinc-505">
            Unknown
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No vehicles found</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
            Start by adding vehicles to the system. You will be able to log trips, plan maintenance, and track expenses.
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
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-505 font-medium">
              <th className="p-4">Reg. Number</th>
              <th className="p-4">Model Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Capacity (kg)</th>
              <th className="p-4">Odometer (km)</th>
              <th className="p-4">Acquisition Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                <td className="p-4 font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {vehicle.regNo}
                </td>
                <td className="p-4 text-zinc-900 dark:text-zinc-50 font-medium">
                  {vehicle.modelName}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 font-semibold text-[10px]">
                    {vehicle.type}
                  </span>
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">
                  {vehicle.capacityKg.toLocaleString()} kg
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">
                  {vehicle.odometerKm.toLocaleString()} km
                </td>
                <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">
                  {formatCurrency(vehicle.acquisitionCost)}
                </td>
                <td className="p-4">{getStatusBadge(vehicle.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(vehicle)}
                      className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(vehicle.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/5 text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete / Retire Vehicle"
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
