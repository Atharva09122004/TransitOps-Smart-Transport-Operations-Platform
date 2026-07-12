"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  driverName: string;
  isDeleting: boolean;
}

export default function DeleteDriverDialog({
  isOpen,
  onClose,
  onConfirm,
  driverName,
  isDeleting
}: DeleteDriverDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl shadow-lg p-6 space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
            <AlertTriangle className="size-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Confirm Deletion
          </h3>
        </div>

        {/* Text */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-zinc-800 dark:text-zinc-200">{driverName}</span>? This action is permanent and cannot be undone.
        </p>

        {/* Button Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="h-9 text-xs px-3"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="h-9 text-xs px-3 bg-red-650 hover:bg-red-700 text-white font-medium border-none"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
