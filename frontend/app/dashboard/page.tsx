"use client";

import * as React from "react";
import {
  TrendingUp,
  Truck,
  User,
  Compass,
  Wrench,
  Activity,
  AlertCircle,
  ChevronDown
} from "lucide-react";

export default function DashboardPage() {
  const [vehicleTypeFilter, setVehicleTypeFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");

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
      </div>

      {/* Excalidraw Filters panel */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 p-4 border border-zinc-200/60 dark:border-zinc-800 rounded-lg">
        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block sm:inline">
          Filters
        </span>
        <div className="flex flex-wrap gap-2.5">
          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded bg-zinc-50/50 dark:bg-zinc-950/30 text-xs">
            <span className="text-zinc-500">Vehicle Type:</span>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="VAN">Van</option>
              <option value="TRUCK">Truck</option>
              <option value="MINI">Mini</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded bg-zinc-50/50 dark:bg-zinc-950/30 text-xs">
            <span className="text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
            </select>
          </div>

          {/* Region Filter placeholder */}
          <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded bg-zinc-50/50 dark:bg-zinc-950/30 text-xs text-zinc-400">
            <span>Region: All</span>
            <ChevronDown className="size-3" />
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Vehicles */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Active Vehicles
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">53</span>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
            <Truck className="size-5" />
          </div>
        </div>

        {/* Available Vehicles */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Available Vehicles
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">42</span>
          </div>
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
            <Activity className="size-5" />
          </div>
        </div>

        {/* Vehicles in Maintenance */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              In Maintenance
            </span>
            <span className="text-2xl font-bold text-amber-500">05</span>
          </div>
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-md">
            <Wrench className="size-5" />
          </div>
        </div>

        {/* Active Trips */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Active / Pending
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">18 / 09</span>
          </div>
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
            <Compass className="size-5" />
          </div>
        </div>
      </div>

      {/* Second Row: Drivers on Duty & Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drivers Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Drivers On Duty
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">26</span>
          </div>
          <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-md">
            <User className="size-5" />
          </div>
        </div>

        {/* Utilization Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-xs">
          <div className="space-y-1 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Fleet Utilization
              </span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">81%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-2">
              <div className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full" style={{ width: "81%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Recent Trips & Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg shadow-xs p-5 lg:col-span-2 space-y-4">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Recent Trips
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-medium">
                  <th className="py-2.5">Trip Code</th>
                  <th className="py-2.5">Vehicle</th>
                  <th className="py-2.5">Driver</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100/50 dark:divide-zinc-850">
                <tr className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-3 font-medium">TR001</td>
                  <td className="py-3">VAN-05</td>
                  <td className="py-3">Alex</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-[10px]">
                      On Trip
                    </span>
                  </td>
                  <td className="py-3 text-right text-zinc-500">45 min</td>
                </tr>
                <tr className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-3 font-medium">TR002</td>
                  <td className="py-3">TRK-12</td>
                  <td className="py-3">John</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 text-right text-zinc-400">—</td>
                </tr>
                <tr className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-3 font-medium">TR003</td>
                  <td className="py-3">MINI-08</td>
                  <td className="py-3">Priya</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-[10px]">
                      Dispatched
                    </span>
                  </td>
                  <td className="py-3 text-right text-zinc-500">1h 10m</td>
                </tr>
                <tr className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-3 font-medium">TR004</td>
                  <td className="py-3">Unassigned</td>
                  <td className="py-3">Unassigned</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium text-[10px]">
                      Draft
                    </span>
                  </td>
                  <td className="py-3 text-right text-zinc-400">Awaiting vehicle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Graph */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg shadow-xs p-5 space-y-5">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Vehicle Status Breakdown
          </span>

          <div className="space-y-4">
            {/* Available */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">Available</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">55%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "55%" }} />
              </div>
            </div>

            {/* On Trip */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">On Trip</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">30%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "30%" }} />
              </div>
            </div>

            {/* In Shop */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">In Shop</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">10%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "10%" }} />
              </div>
            </div>

            {/* Retired */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">Retired</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">5%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: "5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
