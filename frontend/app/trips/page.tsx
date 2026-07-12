"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw } from "lucide-react";
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

export default function TripsPage() {
  const router = useRouter();

  // Component states
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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

      {/* Main Table Content */}
      {isLoading && trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
          <Loader2 className="size-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading trips list...</span>
        </div>
      ) : (
        <TripTable
          trips={trips}
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
