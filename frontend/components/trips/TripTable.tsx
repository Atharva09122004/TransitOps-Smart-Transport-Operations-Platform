"use client";

import * as React from "react";
import { Trip } from "@/types/trip";
import { Play, Check, XCircle, Eye, Edit2, ShieldAlert } from "lucide-react";

interface TripTableProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDispatch: (id: number) => void;
  onComplete: (trip: Trip) => void;
  onCancel: (trip: Trip) => void;
  onView: (id: number) => void;
}

export default function TripTable({
  trips,
  onEdit,
  onDispatch,
  onComplete,
  onCancel,
  onView,
}: TripTableProps) {
  const getStatusBadge = (status: Trip["status"]) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Draft
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Dispatched
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
            Cancelled
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

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No trips found</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
            Start by planning and scheduling a new cargo trip in draft state.
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
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-medium">
              <th className="p-4">Trip Code</th>
              <th className="p-4">Source</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Driver</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {trips.map((trip) => (
              <tr
                key={trip.id}
                className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors"
              >
                <td className="p-4 font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {trip.tripCode}
                </td>
                <td className="p-4 font-medium text-zinc-905 dark:text-zinc-200">
                  {trip.source}
                </td>
                <td className="p-4 font-medium text-zinc-905 dark:text-zinc-200">
                  {trip.destination}
                </td>
                <td className="p-4">
                  {trip.vehicle ? (
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {trip.vehicle.regNo}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {trip.vehicle.modelName}
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="p-4">
                  {trip.driver ? (
                    <div className="font-semibold text-zinc-905 dark:text-zinc-200">
                      {trip.driver.name}
                    </div>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="p-4">{getStatusBadge(trip.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* DRAFT ACTIONS */}
                    {trip.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => onDispatch(trip.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all font-medium text-[10px]"
                          title="Dispatch Trip"
                        >
                          <Play className="size-3 fill-current" />
                          <span>Dispatch</span>
                        </button>
                        <button
                          onClick={() => onCancel(trip)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all font-medium text-[10px]"
                          title="Cancel Trip"
                        >
                          <XCircle className="size-3" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => onEdit(trip)}
                          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                          title="Edit Trip Details"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                      </>
                    )}

                    {/* DISPATCHED ACTIONS */}
                    {trip.status === "DISPATCHED" && (
                      <>
                        <button
                          onClick={() => onComplete(trip)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all font-medium text-[10px]"
                          title="Complete Trip"
                        >
                          <Check className="size-3" />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => onCancel(trip)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all font-medium text-[10px]"
                          title="Cancel Trip"
                        >
                          <XCircle className="size-3" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}

                    {/* COMPLETED or CANCELLED ACTIONS */}
                    {(trip.status === "COMPLETED" || trip.status === "CANCELLED") && (
                      <button
                        onClick={() => onView(trip.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-all font-medium text-[10px]"
                        title="View Details"
                      >
                        <Eye className="size-3" />
                        <span>View</span>
                      </button>
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
