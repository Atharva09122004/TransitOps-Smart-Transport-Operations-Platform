"use client";

import * as React from "react";
import { getSettings, SystemSettings } from "@/services/settings";

interface SettingsContextType {
  settings: SystemSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDistance: (kmValue: number | null | undefined, fractionDigits?: number) => string;
  convertKmToDisplay: (kmValue: number) => number;
  convertDisplayToKm: (displayValue: number) => number;
  distanceUnitLabel: string;
  distanceInputLabel: (label: string) => string;
  currencySymbol: string;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshSettings = React.useCallback(async () => {
    try {
      const data = await getSettings();
      setSettings(data.general);
    } catch (e) {
      console.error("Failed to load settings in provider", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      refreshSettings();
    }
  }, [refreshSettings]);

  const isMiles = React.useMemo(() => {
    if (!settings) return false;
    const unit = settings.distanceUnit.toLowerCase();
    return unit.includes("mile") || unit === "mi";
  }, [settings]);

  const convertKmToDisplay = React.useCallback((kmValue: number) => {
    if (isMiles) {
      return kmValue * 0.621371;
    }
    return kmValue;
  }, [isMiles]);

  const convertDisplayToKm = React.useCallback((displayValue: number) => {
    if (isMiles) {
      return displayValue / 0.621371;
    }
    return displayValue;
  }, [isMiles]);

  const formatDistance = React.useCallback((kmValue: number | null | undefined, fractionDigits = 1) => {
    if (kmValue === null || kmValue === undefined) return "-";
    const value = convertKmToDisplay(Number(kmValue));
    const unit = isMiles ? "mi" : "km";
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    })} ${unit}`;
  }, [convertKmToDisplay, isMiles]);

  const distanceUnitLabel = isMiles ? "mi" : "km";

  const distanceInputLabel = React.useCallback((label: string) => {
    return `${label} (${distanceUnitLabel})`;
  }, [distanceUnitLabel]);

  const currencySymbol = React.useMemo(() => {
    const currencySetting = settings?.currency || "USD ($)";
    const match = currencySetting.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1];
    }
    const parts = currencySetting.trim().split(/\s+/);
    return parts[parts.length - 1];
  }, [settings]);

  const formatCurrency = React.useCallback((amount: number) => {
    const symbol = currencySymbol;

    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    if (symbol === "$") {
      return `${symbol}${formattedNumber}`;
    }
    return `${symbol} ${formattedNumber}`;
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        formatCurrency,
        formatDistance,
        convertKmToDisplay,
        convertDisplayToKm,
        distanceUnitLabel,
        distanceInputLabel,
        currencySymbol,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
