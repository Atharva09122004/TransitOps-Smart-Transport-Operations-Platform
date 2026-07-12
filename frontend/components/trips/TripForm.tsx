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
import { getDrivers } from "@/services/driver";
import { createTrip, updateTrip } from "@/services/trip";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Trip } from "@/types/trip";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

// Zod Schema matching backend validation
const createTripFormSchema = z.object({
  tripCode: z.string().trim().min(1, "Trip code is required"),
  source: z.string().trim().min(1, "Source is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  vehicleId: z.number({ message: "Vehicle is required" }).int().positive(),
  driverId: z.number({ message: "Driver is required" }).int().positive(),
  cargoWeightKg: z.number().positive("Cargo weight must be greater than 0"),
  plannedDistanceKm: z.number().positive("Planned distance must be greater than 0"),
  etaMinutes: z.number().int().positive("ETA must be greater than 0"),
});

const editTripFormSchema = z.object({
  destination: z.string().trim().min(1, "Destination is required"),
  plannedDistanceKm: z.number().positive("Planned distance must be greater than 0"),
  etaMinutes: z.number().int().positive("ETA must be greater than 0"),
  cargoWeightKg: z.number().positive("Cargo weight must be greater than 0"),
});

interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tripToEdit?: Trip | null;
}

export default function TripForm({
  isOpen,
  onClose,
  onSuccess,
  tripToEdit,
}: TripFormProps) {
  const isEditMode = !!tripToEdit;
  const { convertKmToDisplay, convertDisplayToKm, distanceUnitLabel } = useSettings();

  // Selection states
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loadingAssets, setLoadingAssets] = React.useState(false);

  // Form states
  const [tripCode, setTripCode] = React.useState("");
  const [source, setSource] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState<string>("");
  const [driverId, setDriverId] = React.useState<string>("");
  const [cargoWeightKg, setCargoWeightKg] = React.useState("");
  const [plannedDistanceKm, setPlannedDistanceKm] = React.useState("");
  const [etaMinutes, setEtaMinutes] = React.useState("");

  // UI States
  const [isSaving, setIsSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Fetch active fleet/drivers on open
  React.useEffect(() => {
    if (isOpen) {
      setLoadingAssets(true);
      Promise.all([getVehicles(), getDrivers()])
        .then(([vehiclesRes, driversRes]) => {
          if (vehiclesRes.success && Array.isArray(vehiclesRes.vehicles)) {
            // Keep only AVAILABLE vehicles for new trip creation (or current assigned vehicle in edit mode)
            setVehicles(
              vehiclesRes.vehicles.filter(
                (v: Vehicle) => v.status === "AVAILABLE" || (isEditMode && v.id === Number(tripToEdit?.vehicleId))
              )
            );
          }
          if (driversRes.success && Array.isArray(driversRes.drivers)) {
            // Keep active and AVAILABLE drivers (or current assigned driver in edit mode)
            setDrivers(
              driversRes.drivers.filter(
                (d: Driver) => d.isActive && (d.status === "AVAILABLE" || (isEditMode && d.id === Number(tripToEdit?.driverId)))
              )
            );
          }
        })
        .catch(() => {
          toast.error("Failed to load logistical resource directories.");
        })
        .finally(() => {
          setLoadingAssets(false);
        });
    }
  }, [isOpen]);

  // Populate data in Edit mode
  React.useEffect(() => {
    if (tripToEdit) {
      setTripCode(tripToEdit.tripCode);
      setSource(tripToEdit.source);
      setDestination(tripToEdit.destination);
      setVehicleId(tripToEdit.vehicleId?.toString() || "");
      setDriverId(tripToEdit.driverId?.toString() || "");
      setCargoWeightKg(tripToEdit.cargoWeightKg.toString());
      setPlannedDistanceKm(tripToEdit.plannedDistanceKm ? convertKmToDisplay(tripToEdit.plannedDistanceKm).toString() : "");
      setEtaMinutes(tripToEdit.etaMinutes?.toString() || "");
    } else {
      setTripCode("");
      setSource("");
      setDestination("");
      setVehicleId("");
      setDriverId("");
      setCargoWeightKg("");
      setPlannedDistanceKm("");
      setEtaMinutes("");
    }
    setFieldErrors({});
  }, [tripToEdit, isOpen, convertKmToDisplay]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});

    const rawData = {
      tripCode,
      source,
      destination,
      vehicleId: Number(vehicleId),
      driverId: Number(driverId),
      cargoWeightKg: Number(cargoWeightKg),
      plannedDistanceKm: convertDisplayToKm(Number(plannedDistanceKm)),
      etaMinutes: Number(etaMinutes),
    };

    // Validate using Zod based on Mode
    const schema = isEditMode ? editTripFormSchema : createTripFormSchema;
    const validationResult = schema.safeParse(rawData);

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
      if (isEditMode && tripToEdit) {
        await updateTrip(tripToEdit.id, {
          destination: rawData.destination,
          plannedDistanceKm: rawData.plannedDistanceKm,
          etaMinutes: rawData.etaMinutes,
          cargoWeightKg: rawData.cargoWeightKg,
        });
        toast.success("Trip record updated successfully");
      } else {
        await createTrip(rawData);
        toast.success("New trip created successfully");
      }
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
            {isEditMode ? "Modify Trip Schedule" : "Plan & Schedule Trip"}
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
          
          {/* Trip Code (Disabled in Edit) */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Trip Code / Reference Number
            </label>
            <Input
              type="text"
              required
              disabled={isEditMode || isSaving}
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
              placeholder="e.g. TR003"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
            />
            {fieldErrors.tripCode && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.tripCode}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Source */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Source Location
              </label>
              <Input
                type="text"
                required
                disabled={isEditMode || isSaving}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Origin"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.source && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.source}</span>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Destination Location
              </label>
              <Input
                type="text"
                required
                disabled={isSaving}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Endpoint"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.destination && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.destination}</span>
              )}
            </div>
          </div>

          {/* Vehicle Selector (Disabled in Edit) */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Vehicle Assignee
            </label>
            <Select 
              value={vehicleId} 
              onValueChange={(val) => setVehicleId(val || "")}
              disabled={isEditMode || loadingAssets}
            >
              <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md">
                <SelectValue placeholder={loadingAssets ? "Loading assets..." : "Select Vehicle"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.regNo} ({v.modelName}) — Status: {v.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.vehicleId && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.vehicleId}</span>
            )}
          </div>

          {/* Driver Selector (Disabled in Edit) */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Driver Assignee
            </label>
            <Select 
              value={driverId} 
              onValueChange={(val) => setDriverId(val || "")}
              disabled={isEditMode || loadingAssets}
            >
              <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md">
                <SelectValue placeholder={loadingAssets ? "Loading assets..." : "Select Driver"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name} ({d.category}) — Status: {d.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.driverId && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.driverId}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Cargo Weight */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Cargo (kg)
              </label>
              <Input
                type="number"
                required
                disabled={isSaving}
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(e.target.value)}
                placeholder="Weight"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.cargoWeightKg && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.cargoWeightKg}</span>
              )}
            </div>

            {/* Planned Distance */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Distance ({distanceUnitLabel})
              </label>
              <Input
                type="number"
                required
                disabled={isSaving}
                value={plannedDistanceKm}
                onChange={(e) => setPlannedDistanceKm(e.target.value)}
                placeholder="Distance"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.plannedDistanceKm && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.plannedDistanceKm}</span>
              )}
            </div>

            {/* ETA minutes */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                ETA (min)
              </label>
              <Input
                type="number"
                required
                disabled={isSaving}
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(e.target.value)}
                placeholder="Duration"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.etaMinutes && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.etaMinutes}</span>
              )}
            </div>
          </div>

          {/* Actions */}
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
                "Save Trip"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
