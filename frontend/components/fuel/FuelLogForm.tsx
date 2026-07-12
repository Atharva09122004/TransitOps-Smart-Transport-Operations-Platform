"use client";

import * as React from "react";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVehicles } from "@/services/vehicle";
import { createFuelLog } from "@/services/fuel";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";

const fuelFormSchema = z.object({
  vehicleId: z.number({ message: "Vehicle is required" }).int().positive(),
  tripId: z.number().int().positive().optional(),
  logDate: z.string().trim().min(1, "Date is required").refine((val) => {
    const date = new Date(val);
    return !Number.isNaN(date.getTime());
  }, "Please enter a valid date"),
  odometerKm: z.number({ message: "Odometer is required" }).nonnegative("Odometer must be non-negative"),
  liters: z.number({ message: "Liters is required" }).nonnegative("Liters must be non-negative"),
  fuelCost: z.number({ message: "Fuel cost is required" }).nonnegative("Fuel cost must be non-negative"),
  remarks: z.string().optional(),
});

interface FuelLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FuelLogForm({
  isOpen,
  onClose,
  onSuccess,
}: FuelLogFormProps) {
  // Vehicle states
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = React.useState(false);

  // Form states
  const [vehicleId, setVehicleId] = React.useState<string>("");
  const [tripId, setTripId] = React.useState("");
  const [logDate, setLogDate] = React.useState("");
  const [odometerKm, setOdometerKm] = React.useState("");
  const [liters, setLiters] = React.useState("");
  const [fuelCost, setFuelCost] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  // UI States
  const [isSaving, setIsSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Fetch vehicles on modal open
  React.useEffect(() => {
    if (isOpen) {
      setLoadingVehicles(true);
      getVehicles()
        .then((res) => {
          if (res.success && Array.isArray(res.vehicles)) {
            setVehicles(res.vehicles.filter((v: any) => v.status !== "RETIRED"));
          }
        })
        .catch(() => {
          toast.error("Failed to load vehicle list.");
        })
        .finally(() => {
          setLoadingVehicles(false);
        });

      // Set default date to today
      setLogDate(new Date().toISOString().split("T")[0]);
      setVehicleId("");
      setTripId("");
      setOdometerKm("");
      setLiters("");
      setFuelCost("");
      setRemarks("");
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});

    // Convert date string to ISO format
    let isoLogDate = undefined;
    if (logDate) {
      const selectedDate = new Date(logDate);
      selectedDate.setHours(12, 0, 0, 0);
      isoLogDate = selectedDate.toISOString();
    }

    const rawData = {
      vehicleId: Number(vehicleId),
      tripId: tripId ? Number(tripId) : undefined,
      logDate: logDate,
      odometerKm: Number(odometerKm),
      liters: Number(liters),
      fuelCost: Number(fuelCost),
      remarks: remarks || undefined,
    };

    // Zod validation
    const validationResult = fuelFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      await createFuelLog({
        ...rawData,
        logDate: isoLogDate,
      });
      toast.success("Fuel consumption logged successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Internal server error";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Log Fuel Fill-Up
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Vehicle Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Vehicle
            </label>
            <Select value={vehicleId} onValueChange={(val) => setVehicleId(val || "")}>
              <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md">
                <SelectValue placeholder={loadingVehicles ? "Loading Fleet..." : "Select Vehicle"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.regNo} ({v.modelName}) — Odo: {v.odometerKm} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.vehicleId && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.vehicleId}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Trip ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Trip ID (Optional)
              </label>
              <Input
                type="number"
                disabled={isSaving}
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                placeholder="e.g. 15"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.tripId && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.tripId}</span>
              )}
            </div>

            {/* Log Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Log Date
              </label>
              <Input
                type="date"
                required
                disabled={isSaving}
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.logDate && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.logDate}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Odometer */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Odo (km)
              </label>
              <Input
                type="number"
                required
                disabled={isSaving}
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="Mileage"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.odometerKm && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.odometerKm}</span>
              )}
            </div>

            {/* Liters */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Liters
              </label>
              <Input
                type="number"
                step="0.01"
                required
                disabled={isSaving}
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="Volume"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.liters && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.liters}</span>
              )}
            </div>

            {/* Cost */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Cost ($)
              </label>
              <Input
                type="number"
                step="0.01"
                required
                disabled={isSaving}
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                placeholder="Price"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.fuelCost && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.fuelCost}</span>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Remarks (Optional)
            </label>
            <Input
              type="text"
              disabled={isSaving}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Shell gas station, highway fill-up"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
            />
            {fieldErrors.remarks && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.remarks}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-850 mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onClose}
              className="h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 text-xs px-4 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 text-white font-medium"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                "Save Fuel Log"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
