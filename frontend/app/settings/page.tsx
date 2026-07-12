"use client";

import * as React from "react";
import { Loader2, Settings as SettingsIcon, Save, ShieldCheck, Check, Minus } from "lucide-react";
import { getSettings, updateSettings, SystemSettings, RBACRole, SettingsData } from "@/services/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SettingsPage() {
  const router = useRouter();

  const [settingsData, setSettingsData] = React.useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form State
  const [depotName, setDepotName] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [distanceUnit, setDistanceUnit] = React.useState("");

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSettings();
      setSettingsData(data);
      setDepotName(data.general.depotName);
      setCurrency(data.general.currency);
      setDistanceUnit(data.general.distanceUnit);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Unauthorized session. Redirecting to login...");
        router.push("/login");
        return;
      }
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ depotName, currency, distanceUnit });
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderRbacCell = (value: boolean | "view") => {
    if (value === true) return <Check className="size-4 text-emerald-500 mx-auto" />;
    if (value === "view") return <span className="text-xs font-semibold text-zinc-500 mx-auto block text-center">View</span>;
    return <Minus className="size-4 text-zinc-300 dark:text-zinc-700 mx-auto" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3">
        <Loader2 className="size-8 text-zinc-400 animate-spin" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Loading system configurations...</span>
      </div>
    );
  }

  if (!settingsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SettingsIcon className="size-5 text-zinc-900 dark:text-zinc-50" />
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings & RBAC
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* General Settings */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">
              General
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">Depot Name</label>
              <input 
                type="text" 
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">Currency</label>
              <input 
                type="text" 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">Distance Unit</label>
              <input 
                type="text" 
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveGeneral}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save changes
          </button>
        </div>

        {/* Role-Based Access Control */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">
              Role-Based Access (RBAC)
            </h3>
            <ShieldCheck className="size-4 text-zinc-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider font-semibold">
                  <th className="pb-3 min-w-[120px]">Role</th>
                  <th className="pb-3 text-center">Fleet</th>
                  <th className="pb-3 text-center">Drivers</th>
                  <th className="pb-3 text-center">Trips</th>
                  <th className="pb-3 text-center">Fuel/Exp</th>
                  <th className="pb-3 text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {settingsData.rbac.map((row) => (
                  <tr key={row.role} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-50">{row.role}</td>
                    <td className="py-3 text-center">{renderRbacCell(row.fleet)}</td>
                    <td className="py-3 text-center">{renderRbacCell(row.drivers)}</td>
                    <td className="py-3 text-center">{renderRbacCell(row.trips)}</td>
                    <td className="py-3 text-center">{renderRbacCell(row.fuelExp)}</td>
                    <td className="py-3 text-center">{renderRbacCell(row.analytics)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-850">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Note: This is a static view of the current permission matrix. Advanced RBAC management is not active in this environment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
