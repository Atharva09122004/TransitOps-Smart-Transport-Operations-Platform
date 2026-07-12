"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MaintenanceTable from "@/components/maintenance/MaintenanceTable";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { getMaintenanceRecords, completeMaintenance } from "@/services/maintenance";
import { MaintenanceRecord } from "@/types/maintenance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function MaintenancePage() {
  const router = useRouter();

  // Component states
  const [records, setRecords] = React.useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [recordToEdit, setRecordToEdit] = React.useState<MaintenanceRecord | null>(null);

  // Load records from backend API
  const loadRecords = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMaintenanceRecords();
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("Unauthorized session. Redirecting to login...");
          router.push("/login");
          return;
        }
      }
      toast.error("Failed to load maintenance records.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Create Trigger
  const handleAddClick = () => {
    setRecordToEdit(null);
    setIsFormOpen(true);
  };

  // Edit Trigger
  const handleEditClick = (record: MaintenanceRecord) => {
    setRecordToEdit(record);
    setIsFormOpen(true);
  };

  // Complete Trigger
  const handleCompleteClick = async (id: number) => {
    try {
      const res = await completeMaintenance(id);
      if (res.success) {
        toast.success(res.message || "Maintenance record marked as completed");
        loadRecords(); // Refresh list immediately
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Action failed";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Maintenance & Repairs
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track vehicle downtime, record diagnostic checks, log component repairs, and update fleet availability.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <button
            onClick={loadRecords}
            disabled={isLoading}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {/* Add Record Button */}
          <Button
            onClick={handleAddClick}
            disabled={isLoading}
            className="h-10 text-xs px-3.5 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Record Maintenance</span>
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading && records.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
          <Loader2 className="size-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading records...</span>
        </div>
      ) : (
        <MaintenanceTable
          records={records}
          onEdit={handleEditClick}
          onComplete={handleCompleteClick}
        />
      )}

      {/* Form Modal (Handles Create & Edit) */}
      <MaintenanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadRecords}
        recordToEdit={recordToEdit}
      />
    </div>
  );
}
