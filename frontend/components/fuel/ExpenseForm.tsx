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
import { createExpense } from "@/services/expense";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";

const expenseFormSchema = z.object({
  tripId: z.number({ message: "Trip ID is required" }).int().positive("Trip ID must be a positive integer"),
  vehicleId: z.number({ message: "Vehicle is required" }).int().positive(),
  tollCost: z.number().nonnegative("Cost must be non-negative"),
  otherCost: z.number().nonnegative("Cost must be non-negative"),
  maintenanceCleared: z.boolean(),
  status: z.enum(["PENDING", "APPROVED", "PAID"]),
});

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSuccess,
}: ExpenseFormProps) {
  // Vehicle list
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = React.useState(false);

  // Form states
  const [tripId, setTripId] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState<string>("");
  const [tollCost, setTollCost] = React.useState("0");
  const [otherCost, setOtherCost] = React.useState("0");
  const [maintenanceCleared, setMaintenanceCleared] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<"PENDING" | "APPROVED" | "PAID">("PENDING");

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

      setTripId("");
      setVehicleId("");
      setTollCost("0");
      setOtherCost("0");
      setMaintenanceCleared(false);
      setStatus("PENDING");
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});

    const rawData = {
      tripId: Number(tripId),
      vehicleId: Number(vehicleId),
      tollCost: Number(tollCost || 0),
      otherCost: Number(otherCost || 0),
      maintenanceCleared,
      status,
    };

    // Validate using Zod
    const validationResult = expenseFormSchema.safeParse(rawData);
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
      await createExpense(rawData);
      toast.success("Expense logged successfully");
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
            Log Trip Expense
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
          
          <div className="grid grid-cols-2 gap-4">
            {/* Trip ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Trip ID
              </label>
              <Input
                type="number"
                required
                disabled={isSaving}
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                placeholder="e.g. 1"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.tripId && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.tripId}</span>
              )}
            </div>

            {/* Vehicle Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Vehicle
              </label>
              <Select value={vehicleId} onValueChange={(val) => setVehicleId(val || "")}>
                <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-905 rounded-md">
                  <SelectValue placeholder={loadingVehicles ? "Loading Fleet..." : "Select Vehicle"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.regNo} ({v.modelName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.vehicleId && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.vehicleId}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Toll Cost */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Toll Costs ($)
              </label>
              <Input
                type="number"
                step="0.01"
                disabled={isSaving}
                value={tollCost}
                onChange={(e) => setTollCost(e.target.value)}
                placeholder="0"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.tollCost && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.tollCost}</span>
              )}
            </div>

            {/* Other Cost */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Other Costs ($)
              </label>
              <Input
                type="number"
                step="0.01"
                disabled={isSaving}
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                placeholder="0"
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
              />
              {fieldErrors.otherCost && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.otherCost}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Maintenance Cleared */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Maintenance Cleared
              </label>
              <Select 
                value={maintenanceCleared ? "YES" : "NO"} 
                onValueChange={(val) => setMaintenanceCleared(val === "YES")}
              >
                <SelectTrigger className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm rounded-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1">
                  <SelectItem value="NO">Not Cleared</SelectItem>
                  <SelectItem value="YES">Cleared</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.maintenanceCleared && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.maintenanceCleared}</span>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider block">
                Expense Status
              </label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm rounded-md">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.status && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.status}</span>
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
                "Save Expense"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
