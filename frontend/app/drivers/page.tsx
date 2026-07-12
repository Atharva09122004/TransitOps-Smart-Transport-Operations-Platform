"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DriverTable from "@/components/drivers/DriverTable";
import DriverForm from "@/components/drivers/DriverForm";
import DeleteDriverDialog from "@/components/drivers/DeleteDriverDialog";
import { getDrivers, deleteDriver } from "@/services/driver";
import { Driver } from "@/types/driver";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DriversPage() {
  const router = useRouter();

  // Component states
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [driverToEdit, setDriverToEdit] = React.useState<Driver | null>(null);

  // Delete Modal States
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [driverToDelete, setDriverToDelete] = React.useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load drivers from backend API
  const loadDrivers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getDrivers();
      if (res.success && Array.isArray(res.data)) {
        setDrivers(res.data);
      } else {
        setDrivers([]);
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
      toast.error("Failed to load drivers directory.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  // Create Click Trigger
  const handleAddClick = () => {
    setDriverToEdit(null);
    setIsFormOpen(true);
  };

  // Edit Click Trigger
  const handleEditClick = (driver: Driver) => {
    setDriverToEdit(driver);
    setIsFormOpen(true);
  };

  // Delete Click Trigger
  const handleDeleteClick = (id: number) => {
    const target = drivers.find((d) => d.id === id);
    if (target) {
      setDriverToDelete(target);
      setIsDeleteOpen(true);
    }
  };

  // Confirm Delete Action
  const handleDeleteConfirm = async () => {
    if (!driverToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteDriver(driverToDelete.id);
      toast.success("Driver deleted successfully");
      setIsDeleteOpen(false);
      setDriverToDelete(null);
      loadDrivers(); // Refresh table immediately
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const msg = error.response?.data?.message || "Delete failed";

        if (status === 409) {
          toast.error("Cannot delete driver because they are currently assigned to active trips.");
        } else {
          toast.error(msg);
        }
      } else {
        toast.error("Failed to delete driver. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Drivers Directory
          </h1>
          <p className="text-xs text-zinc-505 text-zinc-500 dark:text-zinc-400 mt-1">
            Register and manage operator licenses, classification metrics, and safety scores.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <button
            onClick={loadDrivers}
            disabled={isLoading}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {/* Add Driver Button */}
          <Button
            onClick={handleAddClick}
            disabled={isLoading}
            className="h-10 text-xs px-3.5 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Add Driver</span>
          </Button>
        </div>
      </div>

      {/* Driver Data Table Content */}
      {isLoading && drivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
          <Loader2 className="size-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-550 dark:text-zinc-400">Loading directory...</span>
        </div>
      ) : (
        <DriverTable
          drivers={drivers}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Driver Modal Form (Handles Create + Update) */}
      <DriverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadDrivers}
        driverToEdit={driverToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDriverDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        driverName={driverToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
