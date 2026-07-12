"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CancelTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  tripCode: string;
  isCancelling: boolean;
}

export default function CancelTripDialog({
  isOpen,
  onClose,
  onConfirm,
  tripCode,
  isCancelling,
}: CancelTripDialogProps) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Cancellation reason is required");
      return;
    }

    onConfirm(reason.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Cancel Trip {tripCode}
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
            Are you sure you want to cancel trip **{tripCode}**? Please provide a reason below. This releases the vehicle and driver back to the active resource pool.
          </p>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Cancellation Reason
            </label>
            <Input
              type="text"
              required
              disabled={isCancelling}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Weather delay, client cancel, mechanical breakdown"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 rounded-md"
            />
            {error && <span className="text-[10.5px] text-red-500 font-medium">{error}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-850 mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isCancelling}
              onClick={onClose}
              className="h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCancelling}
              className="h-10 text-xs px-4 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm border-0"
            >
              {isCancelling ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
