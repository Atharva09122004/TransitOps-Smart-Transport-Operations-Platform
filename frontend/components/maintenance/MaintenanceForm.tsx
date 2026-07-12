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
import { createMaintenance, updateMaintenance } from "@/services/maintenance";
import { MaintenanceRecord } from "@/types/maintenance";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";
import axios from "axios";

// Zod Schema matching backend validation
const maintenanceFormSchema = z.object({
  vehicleId: z.number({ required_error: "Vehicle is required" }).int().positive(),
  serviceType: z.string().trim().min(2, "Service type must be at least 2 characters"),
  cost: z.number().nonnegative("Cost must be non-negative"),
  serviceDate: z.string().trim().min(1, "Service date is required").refine((val) => {
    const date = new Date(val);
    return !Number.isNaN(date.getTime());
  }, "Please enter a valid date"),
  notes: z.string().optional(),
});

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recordToEdit?: MaintenanceRecord | null;
}

export default function MaintenanceForm({
  isOpen,
  onClose,
  onSuccess,
  recordToEdit,
}: MaintenanceFormProps) {
  const isEditMode = !!recordToEdit;

  // Active vehicles list
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = React.useState(false);

  // Form states
  const [vehicleId, setVehicleId] = React.useState<string>("");
  const [serviceType, setServiceType] = React.useState("");
  const [cost, setCost] = React.useState("");
  const [serviceDate, setServiceDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

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
            // Keep only non-retired vehicles
            setVehicles(res.vehicles.filter((v) => v.status !== "RETIRED"));
          }
        })
        .catch(() => {
          toast.error("Failed to load vehicle list.");
        })
        .finally(() => {
          setLoadingVehicles(false);
        });
    }
  }, [isOpen]);

  // Populate values in Edit mode
  React.useEffect(() => {
    if (recordToEdit) {
      setVehicleId(recordToEdit.vehicleId.toString());
      setServiceType(recordToEdit.serviceType);
      setCost(recordToEdit.cost.toString());
      
      const dateObj = new Date(recordToEdit.serviceDate);
      const formattedDate = dateObj.toISOString().split("T")[0];
      setServiceDate(formattedDate);
      
      setNotes(recordToEdit.notes || "");
    } else {
      setVehicleId("");
      setServiceType("");
      setCost("0");
      setServiceDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
    setFieldErrors({});
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});

    // Convert date string to ISO datetime format for backend zod schema
    let isoServiceDate = undefined;
    if (serviceDate) {
      const selectedDate = new Date(serviceDate);
      // Ensure it is set to midnight UTC/Local
      selectedDate.setHours(12, 0, 0, 0);
      isoServiceDate = selectedDate.toISOString();
    }

    const formData = {
      vehicleId: Number(vehicleId),
      serviceType,
      cost: Number(cost || 0),
      serviceDate: isoServiceDate,
      notes: notes || undefined,
    };

    // Validate using Zod
    const validationResult = maintenanceFormSchema.safeParse({
      ...formData,
      serviceDate: serviceDate, // validate the raw string format first
    });

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
      if (isEditMode && recordToEdit) {
        await updateMaintenance(recordToEdit.id, {
          serviceType: formData.serviceType,
          cost: formData.cost,
          serviceDate: formData.serviceDate,
          notes: formData.notes,
        });
        toast.success("Maintenance record updated successfully");
      } else {
        await createMaintenance(formData);
        toast.success("Vehicle registered under maintenance successfully");
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
            {isEditMode ? "Edit Maintenance Record" : "Schedule Service / Repair"}
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
            <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Vehicle
            </label>
            <Select 
              value={vehicleId} 
              onValueChange={setVehicleId}
              disabled={isEditMode || loadingVehicles}
            >
              <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md">
                <SelectValue placeholder={loadingVehicles ? "Loading Fleet..." : "Select Vehicle"} />
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

          {/* Service Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Service Type
            </label>
            <Input
              type="text"
              required
              disabled={isSaving}
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. Engine Oil & Filter Change"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-905 rounded-md"
            />
            {fieldErrors.serviceType && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.serviceType}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cost */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Estimated Cost ($)
              </label>
              <Input
                type="number"
                disabled={isSaving}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-905 rounded-md"
              />
              {fieldErrors.cost && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.cost}</span>
              )}
            </div>

            {/* Service Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Service Date
              </label>
              <Input
                type="date"
                required
                disabled={isSaving}
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-905 rounded-md"
              />
              {fieldErrors.serviceDate && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.serviceDate}</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Operator Notes / Remarks (Optional)
            </label>
            <textarea
              disabled={isSaving}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Brake pad wear checked. Replaced rear brake pads and rotors."
              rows={3}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 rounded-md"
            />
            {fieldErrors.notes && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.notes}</span>
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
                "Save Job"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
