"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw, Download, Search, ArrowUpDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripTable from "@/components/trips/TripTable";
import TripForm from "@/components/trips/TripForm";
import CompleteTripDialog from "@/components/trips/CompleteTripDialog";
import CancelTripDialog from "@/components/trips/CancelTripDialog";
import ViewTripDialog from "@/components/trips/ViewTripDialog";
import { getTrips, dispatchTrip, completeTrip, cancelTrip } from "@/services/trip";
import { Trip } from "@/types/trip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { exportTripPDF } from "@/utils/pdfExport";

export default function TripsPage() {
  const router = useRouter();

  // Component states
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);

  const handleExportPDF = async () => {
    if (trips.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    setIsPdfGenerating(true);
    try {
      exportTripPDF(trips);
      toast.success("Trips report exported to PDF successfully");
    } catch (error: any) {
      toast.error("Failed to export PDF: " + error.message);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Search, sort & filter state
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"tripCode" | "status" | "source">("tripCode");
  const [sortAsc, setSortAsc] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<"" | "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED">("");

  // Computed filtered + sorted list
  const filteredTrips = React.useMemo(() => {
    let result = [...trips];
    if (filterStatus) {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.tripCode.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          (t.vehicle?.regNo || "").toLowerCase().includes(q) ||
          (t.driver?.name || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = (a[sortBy] || "") as string;
      const bv = (b[sortBy] || "") as string;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return result;
  }, [trips, search, sortBy, sortAsc, filterStatus]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortAsc((p) => !p);
    else { setSortBy(col); setSortAsc(true); }
  };

  const hasActiveFilters = !!search.trim() || !!filterStatus;
  const clearFilters = () => { setSearch(""); setFilterStatus(""); };

  // Form Modal States (Create / Edit)
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [tripToEdit, setTripToEdit] = React.useState<Trip | null>(null);

  // Dispatch Action States
  const [isDispatching, setIsDispatching] = React.useState(false);

  // Complete Dialog States
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);
  const [tripToComplete, setTripToComplete] = React.useState<Trip | null>(null);
  const [isCompleting, setIsCompleting] = React.useState(false);

  // Cancel Dialog States
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [tripToCancel, setTripToCancel] = React.useState<Trip | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  // Detailed View States
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [tripIdToView, setTripIdToView] = React.useState<number | null>(null);

  // Fetch trips from database
  const loadTrips = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTrips();
      if (res.success && Array.isArray(res.data)) {
        setTrips(res.data);
      } else {
        setTrips([]);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load planned trips.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Create action
  const handleAddClick = () => {
    setTripToEdit(null);
    setIsFormOpen(true);
  };

  // Edit action
  const handleEditClick = (trip: Trip) => {
    setTripToEdit(trip);
    setIsFormOpen(true);
  };

  // Dispatch action
  const handleDispatch = async (id: number) => {
    if (isDispatching) return;
    setIsDispatching(true);
    try {
      const res = await dispatchTrip(id);
      if (res.success) {
        toast.success("Trip successfully dispatched to route");
        loadTrips();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Dispatch failed";
      toast.error(msg);
    } finally {
      setIsDispatching(false);
    }
  };

  // Complete Dialog trigger
  const handleCompleteClick = (trip: Trip) => {
    setTripToComplete(trip);
    setIsCompleteOpen(true);
  };

  // Confirm Complete action
  const handleCompleteConfirm = async (actualDistanceKm: number) => {
    if (!tripToComplete || isCompleting) return;

    setIsCompleting(true);
    try {
      const res = await completeTrip(tripToComplete.id, actualDistanceKm);
      if (res.success) {
        toast.success("Trip marked as completed");
        setIsCompleteOpen(false);
        setTripToComplete(null);
        loadTrips();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Action failed";
      toast.error(msg);
    } finally {
      setIsCompleting(false);
    }
  };

  // Cancel Dialog trigger
  const handleCancelClick = (trip: Trip) => {
    setTripToCancel(trip);
    setIsCancelOpen(true);
  };

  // Confirm Cancel action
  const handleCancelConfirm = async (cancelledReason: string) => {
    if (!tripToCancel || isCancelling) return;

    setIsCancelling(true);
    try {
      const res = await cancelTrip(tripToCancel.id, cancelledReason);
      if (res.success) {
        toast.success("Trip cancelled successfully");
        setIsCancelOpen(false);
        setTripToCancel(null);
        loadTrips();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Action failed";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // View Details trigger
  const handleViewClick = (id: number) => {
    setTripIdToView(id);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Trip Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Dispatch vehicles, assign cargo runs to active drivers, track milestones, and view trip cost reports.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <button
            onClick={loadTrips}
            disabled={isLoading}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Export PDF button */}
          <Button
            onClick={handleExportPDF}
            disabled={isLoading || trips.length === 0 || isPdfGenerating}
            variant="outline"
            className="h-10 text-xs px-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm bg-white dark:bg-zinc-900"
          >
            {isPdfGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span>Export PDF</span>
          </Button>
          {/* Plan Trip Button */}
          <Button
            onClick={handleAddClick}
            disabled={isLoading}
            className="h-10 text-xs px-3.5 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Plan Trip</span>
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
              placeholder="Search by code, source, destination, driver..."
              className="h-9 w-full pl-9 pr-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
            />
          </div>

          {/* Filter dropdown */}
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
              <option value="DRAFT">Draft</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Sort buttons */}
          <div className="flex gap-1.5">
            {(["tripCode", "status", "source"] as const).map((col) => (
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
                {col === "tripCode" ? "Code" : col === "status" ? "Status" : "Source"}
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
            Showing <span className="font-semibold text-zinc-600 dark:text-zinc-300">{filteredTrips.length}</span> of{" "}
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">{trips.length}</span> trips
          </span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading && trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
          <Loader2 className="size-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading trips list...</span>
        </div>
      ) : (
        <TripTable
          trips={filteredTrips}
          onEdit={handleEditClick}
          onDispatch={handleDispatch}
          onComplete={handleCompleteClick}
          onCancel={handleCancelClick}
          onView={handleViewClick}
        />
      )}

      {/* Forms Modal (Handles Plan/Modify Trip) */}
      <TripForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadTrips}
        tripToEdit={tripToEdit}
      />

      {/* Complete Confirmation Modal */}
      <CompleteTripDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={handleCompleteConfirm}
        tripCode={tripToComplete?.tripCode || ""}
        isCompleting={isCompleting}
      />

      {/* Cancel Confirmation Modal */}
      <CancelTripDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        tripCode={tripToCancel?.tripCode || ""}
        isCancelling={isCancelling}
      />

      {/* View Reports Details Modal */}
      <ViewTripDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        tripId={tripIdToView}
      />
    </div>
  );
}
