"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VehicleTable from "@/components/vehicles/VehicleTable";
import VehicleForm from "@/components/vehicles/VehicleForm";
import DeleteVehicleDialog from "@/components/vehicles/DeleteVehicleDialog";
import { getVehicles, deleteVehicle } from "@/services/vehicle";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VehiclesPage() {
  const router = useRouter();

  // Component states
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters State
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [vehicleToEdit, setVehicleToEdit] = React.useState<Vehicle | null>(null);

  // Delete Modal States
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load vehicles from backend API
  const loadVehicles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        search: search.trim() || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      };
      
      const res = await getVehicles(filters);
      if (res.success && Array.isArray(res.vehicles)) {
        setVehicles(res.vehicles);
      } else {
        setVehicles([]);
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
      toast.error("Failed to load vehicles directory.");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter, router]);

  // Run load on filters change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadVehicles();
    }, 300); // 300ms debounce for search input

    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter, loadVehicles]);

  // Create Click Trigger
  const handleAddClick = () => {
    setVehicleToEdit(null);
    setIsFormOpen(true);
  };

  // Edit Click Trigger
  const handleEditClick = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsFormOpen(true);
  };

  // Delete Click Trigger
  const handleDeleteClick = (id: number) => {
    const target = vehicles.find((v) => v.id === id);
    if (target) {
      setVehicleToDelete(target);
      setIsDeleteOpen(true);
    }
  };

  // Confirm Delete Action
  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await deleteVehicle(vehicleToDelete.id);
      toast.success(res.message || "Vehicle processed successfully");
      setIsDeleteOpen(false);
      setVehicleToDelete(null);
      loadVehicles(); // Refresh list immediately
    } catch (error: any) {
      const msg = error.response?.data?.message || "Delete failed";
      toast.error(msg);
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
            Vehicles Fleet
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Register and manage vehicles, capacity details, odometer readings, and operational statuses.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <button
            onClick={loadVehicles}
            disabled={isLoading}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {/* Add Vehicle Button */}
          <Button
            onClick={handleAddClick}
            disabled={isLoading}
            className="h-10 text-xs px-3.5 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search by reg. number or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 w-full bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
          />
        </div>

        {/* Type Filter */}
        <div className="w-full md:w-44">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full h-10 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 text-sm rounded-md">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="VAN">Van</SelectItem>
              <SelectItem value="TRUCK">Truck</SelectItem>
              <SelectItem value="MINI">Mini-truck</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-10 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 text-sm rounded-md">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="ON_TRIP">On Trip</SelectItem>
              <SelectItem value="IN_SHOP">In Shop</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vehicle Data Content */}
      {isLoading && vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
          <Loader2 className="size-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-505 dark:text-zinc-400">Loading fleet...</span>
        </div>
      ) : (
        <VehicleTable
          vehicles={vehicles}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadVehicles}
        vehicleToEdit={vehicleToEdit}
      />

      {/* Delete / Retire Dialog */}
      <DeleteVehicleDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        regNo={vehicleToDelete?.regNo || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
