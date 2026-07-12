"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompleteTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualDistanceKm: number) => void;
  tripCode: string;
  isCompleting: boolean;
}

export default function CompleteTripDialog({
  isOpen,
  onClose,
  onConfirm,
  tripCode,
  isCompleting,
}: CompleteTripDialogProps) {
  const [actualDistanceKm, setActualDistanceKm] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setActualDistanceKm("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const distance = Number(actualDistanceKm);
    if (isNaN(distance) || distance <= 0) {
      setError("Actual distance must be a positive number greater than 0");
      return;
    }

    onConfirm(distance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Complete Trip {tripCode}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Please enter the final odometer actual distance covered for trip **{tripCode}**. Completing the trip returns both the assigned vehicle and driver to the `AVAILABLE` pool.
          </p>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Actual Distance Traveled (km)
            </label>
            <Input
              type="number"
              step="0.01"
              required
              disabled={isCompleting}
              value={actualDistanceKm}
              onChange={(e) => setActualDistanceKm(e.target.value)}
              placeholder="e.g. 156.4"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
            />
            {error && <span className="text-[10.5px] text-red-505 font-medium">{error}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-850 mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isCompleting}
              onClick={onClose}
              className="h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCompleting}
              className="h-10 text-xs px-4 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white font-medium shadow-sm border-0"
            >
              {isCompleting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                "Complete Trip"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
