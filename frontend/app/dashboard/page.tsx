"use client";

import * as React from "react";
import Link from "next/link";
import {
  Truck,
  User,
  Compass,
  Wrench,
  Activity,
  Loader2,
  RefreshCw,
  DollarSign,
  ClipboardList,
  ArrowRight,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardData,
  DashboardData,
  DispatcherRecentTrip,
} from "@/services/dashboard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSettings } from "@/hooks/use-settings";
import { getStoredUserRole } from "@/components/layout/sidebar-layout";

function getTripStatusBadge(status: DispatcherRecentTrip["status"]) {
  switch (status) {
    case "DRAFT":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
          Draft
        </span>
      );
    case "DISPATCHED":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
          Dispatched
        </span>
      );
    case "COMPLETED":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-500">
          Unknown
        </span>
      );
  }
}

function FleetStatusBreakdown({ data }: { data: DashboardData }) {
  const totalActive = data.totalVehicles;
  const pctAvailable = totalActive > 0 ? Math.round((data.availableVehicles / totalActive) * 100) : 0;
  const pctOnTrip = totalActive > 0 ? Math.round((data.vehiclesOnTrip / totalActive) * 100) : 0;
  const pctInShop = totalActive > 0 ? Math.round((data.vehiclesInShop / totalActive) * 100) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs p-5 lg:col-span-1 space-y-5">
      <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
        Active Fleet Status Breakdown
      </span>
      <div className="space-y-4">
        {[
          { label: "Available", pct: pctAvailable, count: data.availableVehicles, color: "bg-emerald-500" },
          { label: "On Trip", pct: pctOnTrip, count: data.vehiclesOnTrip, color: "bg-blue-500" },
          { label: "In Shop (Maintenance)", pct: pctInShop, count: data.vehiclesInShop, color: "bg-amber-500" },
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-600 dark:text-zinc-450 font-medium">{item.label}</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {item.pct}% ({item.count})
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
              <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationsKpiRow({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Active Fleet Size
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.totalVehicles}</span>
        </div>
        <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
          <Truck className="size-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Vehicles In Shop
          </span>
          <span className={`text-2xl font-bold ${data.vehiclesInShop > 0 ? "text-amber-500" : "text-zinc-900 dark:text-zinc-50"}`}>
            {data.vehiclesInShop}
          </span>
        </div>
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md">
          <Wrench className="size-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Drivers Available
          </span>
          <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{data.availableDrivers}</span>
        </div>
        <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-md">
          <User className="size-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Active Trips
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.dispatchedTrips}</span>
        </div>
        <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
          <Compass className="size-5" />
        </div>
      </div>
    </div>
  );
}

function CostKpiRow({ data, formatCurrency }: { data: DashboardData; formatCurrency: (n: number) => string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs md:col-span-1">
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Fleet Utilization Rate
            </span>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{data.fleetUtilization}%</span>
          </div>
          <div className="w-full bg-zinc-150 dark:bg-zinc-850 h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-zinc-900 dark:bg-zinc-50 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.fleetUtilization}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Total Fuel Spending
          </span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(data.fuelCost)}</span>
        </div>
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-md">
          <DollarSign className="size-4.5" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Maintenance Expenses
          </span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(data.maintenanceCost)}</span>
        </div>
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-md">
          <Wrench className="size-4.5" />
        </div>
      </div>
    </div>
  );
}

function FleetManagerDashboard({ data, formatCurrency }: { data: DashboardData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <OperationsKpiRow data={data} />
      <CostKpiRow data={data} formatCurrency={formatCurrency} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FleetStatusBreakdown data={data} />
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs p-5 lg:col-span-2 space-y-4">
          <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
            Quick Guide & Operations Overview
          </span>
          <div className="text-xs space-y-3.5 text-zinc-600 dark:text-zinc-400">
            <p>
              Welcome to the TransitOps Command Portal. Operational cost across the platform is fuel plus maintenance only ({formatCurrency(data.operationalCost)} fleet-wide).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DispatcherDashboard({ data }: { data: DashboardData }) {
  const recentTrips = data.recentTrips ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {data.draftTrips > 0 && (
        <Link
          href="/trips"
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="size-4 shrink-0" />
            <span className="text-xs font-semibold">
              You have {data.draftTrips} trip{data.draftTrips === 1 ? "" : "s"} awaiting dispatch
            </span>
          </div>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Draft Trips</span>
            <span className={`text-2xl font-bold ${data.draftTrips > 0 ? "text-amber-500" : "text-zinc-900 dark:text-zinc-50"}`}>{data.draftTrips}</span>
          </div>
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md"><ClipboardList className="size-5" /></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Dispatched Trips</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.dispatchedTrips}</span>
          </div>
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md"><Compass className="size-5" /></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Available Vehicles</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.availableVehicles}</span>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md"><Truck className="size-5" /></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Available Drivers</span>
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{data.availableDrivers}</span>
          </div>
          <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-md"><User className="size-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Completed Today", value: data.completedToday ?? 0 },
          { label: "Total Trips", value: data.totalTrips },
          { label: "Cancelled Trips", value: data.cancelledTrips },
          { label: "Vehicles On Trip", value: data.vehiclesOnTrip },
          { label: "Drivers On Trip", value: data.driversOnTrip },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              {item.label}
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1 block">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Recent Trips</span>
        </div>
        {recentTrips.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">No trips recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-medium">
                  <th className="p-4">Trip Code</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {recentTrips.map((trip) => (
                  <tr key={trip.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="p-4">
                      <Link href="/trips" className="font-mono font-semibold hover:underline">{trip.tripCode}</Link>
                    </td>
                    <td className="p-4 font-medium">{trip.source} → {trip.destination}</td>
                    <td className="p-4">{trip.vehicle?.regNo ?? "—"}</td>
                    <td className="p-4">{trip.driver?.name ?? "—"}</td>
                    <td className="p-4">{getTripStatusBadge(trip.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SafetyOfficerDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <OperationsKpiRow data={data} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Maintenance Records", value: data.maintenanceRecords ?? 0, icon: Wrench },
          { label: "Upcoming Maintenance", value: data.upcomingMaintenance ?? 0, icon: ClipboardList },
          { label: "Avg Driver Safety Score", value: `${data.driverSafetyScores ?? 0}%`, icon: Shield },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{item.label}</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{item.value}</span>
              </div>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <Icon className="size-5 text-zinc-600 dark:text-zinc-300" />
              </div>
            </div>
          );
        })}
      </div>
      <FleetStatusBreakdown data={data} />
    </div>
  );
}

function FinancialAnalystDashboard({ data, formatCurrency }: { data: DashboardData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Operational Cost", value: formatCurrency(data.operationalCost) },
          { label: "Fuel Cost", value: formatCurrency(data.fuelCost) },
          { label: "Maintenance Cost", value: formatCurrency(data.maintenanceCost) },
          { label: "Fleet ROI", value: `${data.roi}%` },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{item.label}</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{item.value}</span>
          </div>
        ))}
      </div>
      <CostKpiRow data={data} formatCurrency={formatCurrency} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-emerald-500" />
            <span className="text-xs font-semibold">Total Revenue</span>
          </div>
          <span className="text-xl font-bold">{formatCurrency(data.revenue)}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-xl shadow-2xs">
          <span className="text-xs font-semibold block mb-2">Completed Trips</span>
          <span className="text-xl font-bold">{data.completedTrips}</span>
        </div>
      </div>
    </div>
  );
}

const DASHBOARD_TITLES: Record<string, { title: string; subtitle: string }> = {
  FLEET_MANAGER: {
    title: "Operations Dashboard",
    subtitle: "Real-time logistical tracking, routing metrics, and resource diagnostics.",
  },
  DISPATCHER: {
    title: "Dispatch Dashboard",
    subtitle: "Fleet-wide trip queue, resource availability, and recent dispatch activity.",
  },
  SAFETY_OFFICER: {
    title: "Safety & Compliance Dashboard",
    subtitle: "Fleet health, maintenance workload, and driver safety metrics.",
  },
  FINANCIAL_ANALYST: {
    title: "Financial Dashboard",
    subtitle: "Operational costs, revenue, and fleet ROI using the same metrics as Analytics.",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { formatCurrency } = useSettings();
  const [userRole, setUserRole] = React.useState<string>("MEMBER");
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const role = getStoredUserRole();
    setUserRole(role);

    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load dashboard metrics.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    setUserRole(getStoredUserRole());
    loadData();
  }, [loadData]);

  const header = DASHBOARD_TITLES[userRole] ?? DASHBOARD_TITLES.FLEET_MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{header.title}</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{header.subtitle}</p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
          title="Refresh dashboard stats"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && !data ? (
        <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
          <Loader2 className="size-8 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Aggregating live operations...</span>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
          <div className="p-3 bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-full">
            <Activity className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Failed to load metrics</h3>
        </div>
      ) : userRole === "DISPATCHER" ? (
        <DispatcherDashboard data={data} />
      ) : userRole === "SAFETY_OFFICER" ? (
        <SafetyOfficerDashboard data={data} />
      ) : userRole === "FINANCIAL_ANALYST" ? (
        <FinancialAnalystDashboard data={data} formatCurrency={formatCurrency} />
      ) : (
        <FleetManagerDashboard data={data} formatCurrency={formatCurrency} />
      )}
    </div>
  );
}
