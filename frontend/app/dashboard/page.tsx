"use client";

import * as React from "react";
import {
  TrendingUp,
  Truck,
  User,
  Compass,
  Wrench,
  Activity,
  Loader2,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/services/dashboard";
import { getVehicles } from "@/services/vehicle";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSettings } from "@/hooks/use-settings";

export default function DashboardPage() {
  const router = useRouter();
  const { formatCurrency } = useSettings();

  // Dashboard Stats
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, vehiclesData] = await Promise.all([
        getDashboardStats(),
        getVehicles()
      ]);
      setStats(statsData);
      if (vehiclesData.success && Array.isArray(vehiclesData.vehicles)) {
        setVehicles(vehiclesData.vehicles);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic currency logic loaded from hook

  // Calculate status breakdown from live vehicles list
  const activeFleet = vehicles.filter((v) => v.status !== "RETIRED");
  const totalActive = activeFleet.length;
  
  const countAvailable = activeFleet.filter((v) => v.status === "AVAILABLE").length;
  const countOnTrip = activeFleet.filter((v) => v.status === "ON_TRIP").length;
  const countInShop = activeFleet.filter((v) => v.status === "IN_SHOP").length;

  const pctAvailable = totalActive > 0 ? Math.round((countAvailable / totalActive) * 100) : 0;
  const pctOnTrip = totalActive > 0 ? Math.round((countOnTrip / totalActive) * 100) : 0;
  const pctInShop = totalActive > 0 ? Math.round((countInShop / totalActive) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Greeting Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Operations Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time logistical tracking, routing metrics, and resource diagnostics.
          </p>
        </div>
        <div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh dashboard stats"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
          <Loader2 className="size-8 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Aggregating live operations...</span>
        </div>
      ) : !stats ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
          <div className="p-3 bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-full">
            <Activity className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Failed to load metrics</h3>
            <p className="text-xs text-zinc-450">We encountered an issue fetching real-time dashboard data.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Vehicles */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Active Fleet Size
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.activeVehicles}
                </span>
              </div>
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                <Truck className="size-5" />
              </div>
            </div>

            {/* In Maintenance */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Vehicles In Shop
                </span>
                <span className={`text-2xl font-bold ${stats.vehiclesInShop > 0 ? "text-amber-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                  {stats.vehiclesInShop}
                </span>
              </div>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md">
                <Wrench className="size-5" />
              </div>
            </div>

            {/* Drivers Available */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Drivers Available
                </span>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.driversAvailable}
                </span>
              </div>
              <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-md">
                <User className="size-5" />
              </div>
            </div>

            {/* Dispatched Trips */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Active Trips
                </span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.activeTrips}
                </span>
              </div>
              <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
                <Compass className="size-5" />
              </div>
            </div>
          </div>

          {/* Second Row: Fleet Utilization & Operational Costs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Utilization Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs md:col-span-1">
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Fleet Utilization Rate
                  </span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {stats.fleetUtilization}%
                  </span>
                </div>
                <div className="w-full bg-zinc-150 dark:bg-zinc-850 h-2.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-zinc-900 dark:bg-zinc-50 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stats.fleetUtilization}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Fuel Cost Sum */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Total Fuel Spending
                </span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(stats.fuelCost)}
                </span>
              </div>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-md">
                <DollarSign className="size-4.5" />
              </div>
            </div>

            {/* Maintenance Cost Sum */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Maintenance Expenses
                </span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(stats.maintenanceCost)}
                </span>
              </div>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-md">
                <Wrench className="size-4.5" />
              </div>
            </div>

          </div>

          {/* Third Row: Recent Trips & Status Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Vehicle Status Breakdown */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs p-5 lg:col-span-1 space-y-5">
              <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
                Active Fleet Status Breakdown
              </span>

              <div className="space-y-4">
                {/* Available */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-450 font-medium">Available</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pctAvailable}% ({countAvailable})</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pctAvailable}%` }} />
                  </div>
                </div>

                {/* On Trip */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-455 font-medium">On Trip</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pctOnTrip}% ({countOnTrip})</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pctOnTrip}%` }} />
                  </div>
                </div>

                {/* In Shop */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-455 font-medium">In Shop (Maintenance)</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pctInShop}% ({countInShop})</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pctInShop}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Static Logistical Map / Quick Reference (Spans 2) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs p-5 lg:col-span-2 space-y-4">
              <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
                Quick Guide & Operations Overview
              </span>
              <div className="text-xs space-y-3.5 text-zinc-600 dark:text-zinc-400">
                <p>
                  Welcome to the **TransitOps Command Portal**. This system integrates direct vehicle diagnostic states, refueling inputs, and financial operations.
                </p>
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-850 rounded-lg space-y-1">
                    <h4 className="font-semibold text-zinc-850 dark:text-zinc-150">Fleet Refueling</h4>
                    <p className="text-[10.5px] text-zinc-450 leading-relaxed">
                      Entering refueling records instantly updates vehicle odometers across the fleet logs.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-850 rounded-lg space-y-1">
                    <h4 className="font-semibold text-zinc-850 dark:text-zinc-150">Asset Maintenance</h4>
                    <p className="text-[10.5px] text-zinc-450 leading-relaxed">
                      Registering repair jobs automatically toggles vehicle availability to `In Shop`.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
