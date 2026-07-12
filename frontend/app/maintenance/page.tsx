"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw, Search, ArrowUpDown, Filter, X } from "lucide-react";
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

  // Search, sort & filter state
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"serviceDate" | "status" | "serviceType">("serviceDate");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<"" | "IN_SHOP" | "COMPLETED">("");

  const filteredRecords = React.useMemo(() => {
    let result = [...records];
    if (filterStatus) {
      result = result.filter((r) => r.status === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.serviceType.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          (r.notes || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = (a[sortBy] || "") as string;
      const bv = (b[sortBy] || "") as string;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return result;
  }, [records, search, sortBy, sortAsc, filterStatus]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortAsc((p) => !p);
    else { setSortBy(col); setSortAsc(true); }
  };

  const hasActiveFilters = !!search.trim() || !!filterStatus;
  const clearFilters = () => { setSearch(""); setFilterStatus(""); };

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
        toast.success((res as any).message || "Maintenance record marked as completed");
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

      {/* Search, Sort & Filter Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service type, status, notes..."
              className="h-9 w-full pl-9 pr-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className={`h-9 pl-7 pr-8 rounded-md border text-xs font-medium transition-colors appearance-none cursor-pointer focus:outline-none ${
                filterStatus
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <option value="">All Statuses</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Sort buttons */}
          <div className="flex gap-1.5">
            {(["serviceDate", "status", "serviceType"] as const).map((col) => (
              <button
                key={col}
                onClick={() => toggleSort(col)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                  sortBy === col
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <ArrowUpDown className="size-3" />
                {col === "serviceDate" ? "Date" : col === "status" ? "Status" : "Type"}
                {sortBy === col && <span className="ml-0.5">{sortAsc ? "↑" : "↓"}</span>}
              </button>
            ))}
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
            >
              <X className="size-3" />
              Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span>
            Showing <span className="font-semibold text-zinc-600 dark:text-zinc-300">{filteredRecords.length}</span> of{" "}
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">{records.length}</span> records
          </span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
              Filtered
            </span>
          )}
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
          records={filteredRecords}
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
