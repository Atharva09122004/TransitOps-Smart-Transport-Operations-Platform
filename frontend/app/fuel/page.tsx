"use client";

import * as React from "react";
import { Plus, Loader2, RefreshCw, Fuel, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import FuelLogTable from "@/components/fuel/FuelLogTable";
import ExpenseTable from "@/components/fuel/ExpenseTable";
import FuelLogForm from "@/components/fuel/FuelLogForm";
import ExpenseForm from "@/components/fuel/ExpenseForm";
import { getFuelLogs } from "@/services/fuel";
import { getExpenses } from "@/services/expense";
import { FuelLog } from "@/types/fuel";
import { Expense } from "@/types/expense";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { exportExpensePDF } from "@/utils/pdfExport";
import { exportToCSV } from "@/utils/csvExport";

export default function FuelExpensesPage() {
  const router = useRouter();

  // Active tab state ("FUEL" | "EXPENSE")
  const [activeTab, setActiveTab] = React.useState<"FUEL" | "EXPENSE">("FUEL");

  // Fuel logs states
  const [fuelLogs, setFuelLogs] = React.useState<FuelLog[]>([]);
  const [loadingFuel, setLoadingFuel] = React.useState(true);
  const [isFuelFormOpen, setIsFuelFormOpen] = React.useState(false);

  // Expenses states
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = React.useState(true);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = React.useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);

  const handleExportPDF = async () => {
    const currentData = activeTab === "FUEL" ? fuelLogs : expenses;
    if (currentData.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    setIsPdfGenerating(true);
    try {
      const filters: Record<string, string> = { "Tab": activeTab === "FUEL" ? "Fuel Logs" : "Trip Expenses" };
      exportExpensePDF(currentData, activeTab, filters);
      toast.success(`${activeTab === "FUEL" ? "Fuel" : "Expenses"} report exported to PDF successfully`);
    } catch (error: any) {
      toast.error("Failed to export PDF: " + error.message);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Load Fuel Logs
  const loadFuelLogs = React.useCallback(async () => {
    setLoadingFuel(true);
    try {
      const res = await getFuelLogs();
      if (res.success && Array.isArray(res.data)) {
        setFuelLogs(res.data);
      } else {
        setFuelLogs([]);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load fuel consumption logs.");
    } finally {
      setLoadingFuel(false);
    }
  }, [router]);

  // Load Expenses
  const loadExpenses = React.useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const res = await getExpenses();
      if (res.success && Array.isArray(res.data)) {
        setExpenses(res.data);
      } else {
        setExpenses([]);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load trip expenses.");
    } finally {
      setLoadingExpenses(false);
    }
  }, [router]);

  // Initial load & reaction to active tab
  React.useEffect(() => {
    if (activeTab === "FUEL") {
      loadFuelLogs();
    } else {
      loadExpenses();
    }
  }, [activeTab, loadFuelLogs, loadExpenses]);

  const handleRefresh = () => {
    if (activeTab === "FUEL") {
      loadFuelLogs();
    } else {
      loadExpenses();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Fuel & Expenses
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track fuel efficiency, record gas station receipts, and register toll road expenditures.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={activeTab === "FUEL" ? loadingFuel : loadingExpenses}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw
              className={`size-4 ${
                (activeTab === "FUEL" ? loadingFuel : loadingExpenses) ? "animate-spin" : ""
              }`}
            />
          </button>
          {/* Export PDF button */}
          <Button
            onClick={handleExportPDF}
            disabled={isPdfGenerating || (activeTab === "FUEL" ? fuelLogs.length === 0 : expenses.length === 0)}
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
          {/* Add Actions based on Active Tab */}
          {activeTab === "FUEL" ? (
            <Button
              onClick={() => setIsFuelFormOpen(true)}
              className="h-10 text-xs px-3.5 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Log Refueling</span>
            </Button>
          ) : (
            <Button
              onClick={() => setIsExpenseFormOpen(true)}
              className="h-10 text-xs px-3.5 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Log Expense</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("FUEL")}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "FUEL"
              ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350"
          }`}
        >
          <Fuel className="size-4" />
          <span>Fuel Logs</span>
        </button>
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "EXPENSE"
              ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350"
          }`}
        >
          <DollarSign className="size-4" />
          <span>Trip Expenses</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "FUEL" ? (
        loadingFuel && fuelLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
            <Loader2 className="size-6 text-zinc-400 animate-spin" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading fuel logs...</span>
          </div>
        ) : (
          <FuelLogTable logs={fuelLogs} />
        )
      ) : loadingExpenses && expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl">
          <Loader2 className="size-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading trip expenses...</span>
        </div>
      ) : (
        <ExpenseTable expenses={expenses} />
      )}

      {/* Forms Popups */}
      <FuelLogForm
        isOpen={isFuelFormOpen}
        onClose={() => setIsFuelFormOpen(false)}
        onSuccess={loadFuelLogs}
      />
      
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSuccess={loadExpenses}
      />
    </div>
  );
}
