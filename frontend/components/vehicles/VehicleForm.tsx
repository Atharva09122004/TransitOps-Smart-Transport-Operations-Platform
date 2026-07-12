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
import { createVehicle, updateVehicle } from "@/services/vehicle";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";
import axios from "axios";
import { useSettings } from "@/hooks/use-settings";

// Zod Schema matching backend validation requirements
const vehicleFormSchema = z.object({
  regNo: z.string().trim().min(1, "Registration number is required"),
  modelName: z.string().trim().min(1, "Model name is required"),
  type: z.enum(["VAN", "TRUCK", "MINI"], {
    message: "Type must be VAN, TRUCK, or MINI",
  }),
  capacityKg: z.number().gt(0, "Capacity must be greater than 0"),
  odometerKm: z.number().nonnegative("Odometer must be greater than or equal to 0"),
  acquisitionCost: z.number().nonnegative("Acquisition cost must be greater than or equal to 0"),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
});

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleToEdit?: Vehicle | null;
}

export default function VehicleForm({
  isOpen,
  onClose,
  onSuccess,
  vehicleToEdit,
}: VehicleFormProps) {
  const isEditMode = !!vehicleToEdit;
  const { convertKmToDisplay, convertDisplayToKm, distanceUnitLabel, currencySymbol } = useSettings();

  // Form values state
  const [regNo, setRegNo] = React.useState("");
  const [modelName, setModelName] = React.useState("");
  const [type, setType] = React.useState<"VAN" | "TRUCK" | "MINI">("VAN");
  const [capacityKg, setCapacityKg] = React.useState("");
  const [odometerKm, setOdometerKm] = React.useState("");
  const [acquisitionCost, setAcquisitionCost] = React.useState("");
  const [status, setStatus] = React.useState<"AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED">("AVAILABLE");

  // UI States
  const [isSaving, setIsSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Populate values when in Edit mode
  React.useEffect(() => {
    if (vehicleToEdit) {
      setRegNo(vehicleToEdit.regNo);
      setModelName(vehicleToEdit.modelName);
      setType(vehicleToEdit.type);
      setCapacityKg(vehicleToEdit.capacityKg.toString());
      setOdometerKm(convertKmToDisplay(vehicleToEdit.odometerKm).toString());
      setAcquisitionCost(vehicleToEdit.acquisitionCost.toString());
      setStatus(vehicleToEdit.status);
    } else {
      setRegNo("");
      setModelName("");
      setType("VAN");
      setCapacityKg("");
      setOdometerKm("0");
      setAcquisitionCost("0");
      setStatus("AVAILABLE");
    }
    setFieldErrors({});
  }, [vehicleToEdit, isOpen, convertKmToDisplay]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});

    const formData = {
      regNo,
      modelName,
      type,
      capacityKg: Number(capacityKg),
      odometerKm: convertDisplayToKm(Number(odometerKm || 0)),
      acquisitionCost: Number(acquisitionCost || 0),
      status: isEditMode ? status : undefined,
    };

    // Run zod manual validation
    const validationResult = vehicleFormSchema.safeParse(formData);
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
      if (isEditMode && vehicleToEdit) {
        await updateVehicle(vehicleToEdit.id, formData);
        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle(formData);
        toast.success("Vehicle created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const msg = error.response?.data?.message || "Internal server error";

        if (status === 400 && msg.includes("exists")) {
          setFieldErrors({ regNo: "Registration number already exists" });
          toast.error("A vehicle with this registration number already exists.");
        } else {
          toast.error(msg);
        }
      } else {
        toast.error("Failed to save vehicle. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Registration Number */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Registration Number
            </label>
            <Input
              type="text"
              required
              disabled={isSaving}
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="e.g. TX-9874"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
            />
            {fieldErrors.regNo && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.regNo}</span>
            )}
          </div>

          {/* Model Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Model Name
            </label>
            <Input
              type="text"
              required
              disabled={isSaving}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. Ford Transit"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
            />
            {fieldErrors.modelName && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.modelName}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Vehicle Type
              </label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="MINI">Mini-truck</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.type && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.type}</span>
              )}
            </div>

            {/* Capacity (Kg) */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Capacity (kg)
              </label>
              <Input
                type="number"
                required
                disabled={isSaving}
                value={capacityKg}
                onChange={(e) => setCapacityKg(e.target.value)}
                placeholder="e.g. 2500"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
              />
              {fieldErrors.capacityKg && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.capacityKg}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Odometer */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Odometer ({distanceUnitLabel})
              </label>
              <Input
                type="number"
                disabled={isSaving}
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="0"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
              />
              {fieldErrors.odometerKm && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.odometerKm}</span>
              )}
            </div>

            {/* Acquisition Cost */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Acquisition Cost ({currencySymbol})
              </label>
              <Input
                type="number"
                disabled={isSaving}
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                placeholder="0"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
              />
              {fieldErrors.acquisitionCost && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.acquisitionCost}</span>
              )}
            </div>
          </div>

          {/* Status Selection (Edit mode only) */}
          {isEditMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
                Operational Status
              </label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ON_TRIP">On Trip</SelectItem>
                  <SelectItem value="IN_SHOP">In Shop</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.status && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.status}</span>
              )}
            </div>
          )}

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
                "Save Vehicle"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
