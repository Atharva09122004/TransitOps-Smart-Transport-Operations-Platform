"use client";

import * as React from "react";
import { Loader2, RefreshCw, BarChart3, TrendingUp, Landmark, ShieldAlert, Sparkles, Fuel, Wrench, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAnalyticsReport } from "@/services/report";
import { getVehicles } from "@/services/vehicle";
import { AnalyticsReport } from "@/types/report";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSettings } from "@/hooks/use-settings";
import { exportAnalyticsPDF } from "@/utils/pdfExport";

export default function ReportsPage() {
  const router = useRouter();
  const { formatCurrency, convertKmToDisplay, distanceUnitLabel } = useSettings();

  // Reports data state
  const [report, setReport] = React.useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);

  const handleExportPDF = async () => {
    setIsPdfGenerating(true);
    try {
      const res = await getVehicles();
      if (res.success && Array.isArray(res.data)) {
        exportAnalyticsPDF(res.data);
        toast.success("Analytics report exported to PDF successfully");
      } else {
        toast.error("Failed to load vehicle details for analytics export.");
      }
    } catch (error: any) {
      toast.error("Failed to export PDF: " + error.message);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Load report data
  const loadReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAnalyticsReport();
      setReport(data);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load operations analytics reports.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const fuelEfficiencyDisplay = React.useMemo(() => {
    if (!report?.summary?.fuelEfficiency) return "—";
    const rawVal = parseFloat(report.summary.fuelEfficiency);
    if (isNaN(rawVal)) return report.summary.fuelEfficiency;
    const converted = convertKmToDisplay(rawVal);
    return `${converted.toFixed(2)} ${distanceUnitLabel}/l`;
  }, [report, convertKmToDisplay, distanceUnitLabel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="size-5 text-zinc-900 dark:text-zinc-50" />
            <span>Analytics</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time financial and operational aggregates. View operational costs, revenue reports, and asset utilization metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadReport}
            disabled={isLoading}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button
            onClick={handleExportPDF}
            disabled={isLoading || isPdfGenerating}
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
        </div>
      </div>

      {isLoading && !report ? (
        <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
          <Loader2 className="size-8 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Calculating operations metrics...</span>
        </div>
      ) : !report ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
          <div className="p-3 bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-full">
            <ShieldAlert className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Report generation failed</h3>
            <p className="text-xs text-zinc-400 max-w-xs">There was an issue compiling the fleet datasets.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Operational Cost Card */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
                  Total Operational Cost
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Landmark className="size-3.5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(report.summary.operationalCost)}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Sum of maintenance, refueling logs, and trip expenses.
              </p>
            </div>

            {/* Fleet Utilization Card */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
                  Fleet Utilization
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <TrendingUp className="size-3.5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {report.summary.fleetUtilization}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Percentage of non-retired vehicles actively on a trip.
              </p>
            </div>

            {/* Fuel Efficiency Card */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
                  Fuel Efficiency
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Fuel className="size-3.5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {fuelEfficiencyDisplay}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Average distance covered per liter of fuel used.
              </p>
            </div>

            {/* ROI Card */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider block">
                  Vehicle ROI Rate
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="size-3.5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {report.summary.vehicleROI}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Net operational profit against fleet acquisition capital.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Costliest Vehicles Table (Span 2) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="size-4.5 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Costliest Fleet Assets</h3>
              </div>
              
              {report.topCostliestVehicles.length === 0 ? (
                <div className="text-center p-8 text-zinc-450 text-xs">No active asset cost logs.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-medium">
                        <th className="pb-3">Vehicle</th>
                        <th className="pb-3">Model</th>
                        <th className="pb-3 text-right">Total Operating Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {report.topCostliestVehicles.map((item) => (
                        <tr key={item.vehicleId} className="text-zinc-700 dark:text-zinc-300">
                          <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                            {item.regNo}
                          </td>
                          <td className="py-3 text-zinc-500 dark:text-zinc-400">{item.modelName}</td>
                          <td className="py-3 text-right font-mono font-semibold text-red-500/90">
                            {formatCurrency(item.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Monthly Revenue Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4.5 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Monthly Revenue Tracker</h3>
              </div>
              
              {report.monthlyRevenue.length === 0 ? (
                <div className="text-center p-8 text-zinc-450 text-xs">No revenue entries recorded.</div>
              ) : (
                <div className="space-y-3">
                  {report.monthlyRevenue.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-lg border border-zinc-105/50 dark:border-zinc-850 bg-zinc-50/30 dark:bg-zinc-950/20"
                    >
                      <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-200">{item.month}</span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
