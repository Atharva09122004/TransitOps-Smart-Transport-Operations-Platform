"use client";

import * as React from "react";
import { X, Loader2, Compass, Truck, User, Fuel, DollarSign, Sparkles } from "lucide-react";
import { getTripById } from "@/services/trip";
import { Trip } from "@/types/trip";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

interface ViewTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number | null;
}

export default function ViewTripDialog({
  isOpen,
  onClose,
  tripId,
}: ViewTripDialogProps) {
  const { formatCurrency, formatDistance } = useSettings();
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && tripId) {
      setIsLoading(true);
      getTripById(tripId)
        .then((res) => {
          if (res.success && res.data) {
            setTrip(res.data);
          }
        })
        .catch(() => {
          toast.error("Failed to load trip reports dataset.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setTrip(null);
    }
  }, [isOpen, tripId]);

  if (!isOpen) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-850">
          <div className="flex items-center gap-2">
            <Compass className="size-5 text-zinc-550 dark:text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Trip Details — {trip?.tripCode || "Loading..."}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-2">
            <Loader2 className="size-6 text-zinc-400 animate-spin" />
            <span className="text-xs text-zinc-400 font-medium">Fetching dataset...</span>
          </div>
        ) : !trip ? (
          <div className="p-10 text-center text-xs text-zinc-450">Unable to load trip records.</div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Row 1: Summary Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-850 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Status</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200 mt-1 block uppercase text-[10px]">
                  {trip.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Cargo Load</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200 mt-1 block">
                  {trip.cargoWeightKg.toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Planned distance</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200 mt-1 block">
                  {trip.plannedDistanceKm ? formatDistance(trip.plannedDistanceKm) : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Actual distance</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200 mt-1 block">
                  {trip.actualDistanceKm ? formatDistance(trip.actualDistanceKm) : "—"}
                </span>
              </div>
            </div>

            {/* Row 2: Route and Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-zinc-100 dark:border-zinc-850 pb-5">
              <div className="space-y-2">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Route Directory</h3>
                <div className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{trip.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{trip.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planned Duration:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{trip.etaMinutes ? `${trip.etaMinutes} mins` : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Log Timestamps</h3>
                <div className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(trip.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispatched:</span>
                    <span>{formatDate(trip.dispatchedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span>{formatDate(trip.completedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Assigned Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-zinc-100 dark:border-zinc-850 pb-5">
              {/* Vehicle */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350">
                  <Truck className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">Assigned Vehicle</h4>
                  {trip.vehicle ? (
                    <div className="mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-400">
                      <p className="font-medium text-zinc-900 dark:text-zinc-150">{trip.vehicle.regNo}</p>
                      <p>{trip.vehicle.modelName}</p>
                    </div>
                  ) : (
                    <p className="text-zinc-400 mt-0.5">No vehicle assigned</p>
                  )}
                </div>
              </div>

              {/* Driver */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350">
                  <User className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">Assigned Driver</h4>
                  {trip.driver ? (
                    <div className="mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-400">
                      <p className="font-medium text-zinc-900 dark:text-zinc-150">{trip.driver.name}</p>
                    </div>
                  ) : (
                    <p className="text-zinc-400 mt-0.5">No driver assigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Refuels, Expenses & Revenue */}
            <div className="space-y-4 text-xs">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Trip Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Refuels list */}
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/10 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-850 dark:text-zinc-200">
                    <Fuel className="size-4 text-zinc-500" />
                    <span>Fuel Refueling</span>
                  </div>
                  {trip.fuelLogs && trip.fuelLogs.length > 0 ? (
                    <div className="space-y-2">
                      {trip.fuelLogs.map((log) => (
                        <div key={log.id} className="flex justify-between text-[11px] border-b border-zinc-100 dark:border-zinc-850 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-zinc-500">{log.liters}L</span>
                          <span className="font-mono font-medium text-zinc-900 dark:text-zinc-300">{formatCurrency(log.fuelCost)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-[10.5px]">No refueling logs</p>
                  )}
                </div>

                {/* Expenses list */}
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/10 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-850 dark:text-zinc-200">
                    <DollarSign className="size-4 text-zinc-500" />
                    <span>Trip Expenses</span>
                  </div>
                  {trip.expenses && trip.expenses.length > 0 ? (
                    <div className="space-y-2">
                      {trip.expenses.map((exp) => (
                        <div key={exp.id} className="flex justify-between text-[11px] border-b border-zinc-100 dark:border-zinc-850 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-zinc-550">Toll / Other</span>
                          <span className="font-mono font-medium text-zinc-900 dark:text-zinc-300">
                            {formatCurrency(Number(exp.tollCost) + Number(exp.otherCost))}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-[10.5px]">No expenses logged</p>
                  )}
                </div>

                {/* Revenue */}
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/10 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-850 dark:text-zinc-200">
                    <Sparkles className="size-4 text-zinc-500" />
                    <span>Contract Revenue</span>
                  </div>
                  <div className="flex flex-col justify-center h-10">
                    {trip.revenue ? (
                      <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(trip.revenue.revenue)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10.5px]">—</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Cancellation Message (if cancelled) */}
            {trip.status === "CANCELLED" && trip.cancelledReason && (
              <div className="p-4 border border-red-200/50 bg-red-500/5 dark:bg-red-950/10 text-red-600 dark:text-red-400 rounded-xl text-xs space-y-1">
                <span className="font-semibold uppercase tracking-wider text-[9.5px]">Cancellation Reason:</span>
                <p className="leading-relaxed">{trip.cancelledReason}</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
