"use client";

import * as React from "react";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDriver, updateDriver } from "@/services/driver";
import { Driver } from "@/types/driver";
import { toast } from "sonner";
import axios from "axios";

// Zod Schema matching backend validation requirements
const driverFormSchema = z.object({
  name: z.string().trim().min(1, "Driver name is required"),
  licenseNo: z.string().trim().min(1, "License number is required"),
  category: z.enum(["LMV", "HMV"], {
    errorMap: () => ({ message: "Category must be LMV or HMV" }),
  }),
  licenseExpiry: z.string().trim().min(1, "License expiry date is required").refine((val) => {
    const date = new Date(val);
    return !Number.isNaN(date.getTime());
  }, "Please enter a valid date"),
  contact: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      return /^\d{10}$/.test(val);
    }, "Contact number must be exactly 10 digits"),
});

interface DriverFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driverToEdit?: Driver | null;
}

export default function DriverForm({
  isOpen,
  onClose,
  onSuccess,
  driverToEdit,
}: DriverFormProps) {
  const isEditMode = !!driverToEdit;

  // Form values state
  const [name, setName] = React.useState("");
  const [licenseNo, setLicenseNo] = React.useState("");
  const [category, setCategory] = React.useState<"LMV" | "HMV">("LMV");
  const [licenseExpiry, setLicenseExpiry] = React.useState("");
  const [contact, setContact] = React.useState("");

  // UI States
  const [isSaving, setIsSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Populate values when in Edit mode
  React.useEffect(() => {
    if (driverToEdit) {
      setName(driverToEdit.name);
      setLicenseNo(driverToEdit.licenseNo);
      setCategory(driverToEdit.category);
      // Format date to YYYY-MM-DD for input element
      const dateObj = new Date(driverToEdit.licenseExpiry);
      const formattedDate = dateObj.toISOString().split("T")[0];
      setLicenseExpiry(formattedDate);
      setContact(driverToEdit.contact || "");
    } else {
      setName("");
      setLicenseNo("");
      setCategory("LMV");
      setLicenseExpiry("");
      setContact("");
    }
    setFieldErrors({});
  }, [driverToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});

    const formData = {
      name,
      licenseNo,
      category,
      licenseExpiry,
      contact: contact || undefined,
    };

    // Run zod manual validation
    const validationResult = driverFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && driverToEdit) {
        await updateDriver(driverToEdit.id, formData);
        toast.success("Driver updated successfully");
      } else {
        await createDriver(formData);
        toast.success("Driver created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const msg = error.response?.data?.message || "Internal service error";

        if (status === 409) {
          setFieldErrors({ licenseNo: "License number already exists" });
          toast.error("A driver with this license number already exists.");
        } else if (status === 400) {
          toast.error(`Validation Error: ${msg}`);
        } else {
          toast.error(msg);
        }
      } else {
        toast.error("Failed to save driver. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {isEditMode ? "Edit Driver" : "Add Driver"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Driver Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Driver Name
            </label>
            <Input
              type="text"
              required
              disabled={isSaving}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
            />
            {fieldErrors.name && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.name}</span>
            )}
          </div>

          {/* License Number */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              License Number
            </label>
            <Input
              type="text"
              required
              disabled={isSaving}
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              placeholder="e.g. DL-123456"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
            />
            {fieldErrors.licenseNo && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.licenseNo}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                License Category
              </label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                  <SelectItem value="LMV">LMV (Light Motor)</SelectItem>
                  <SelectItem value="HMV">HMV (Heavy Motor)</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.category && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.category}</span>
              )}
            </div>

            {/* License Expiry */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                License Expiry
              </label>
              <Input
                type="date"
                required
                disabled={isSaving}
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
              />
              {fieldErrors.licenseExpiry && (
                <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.licenseExpiry}</span>
              )}
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Contact Number (Optional)
            </label>
            <Input
              type="text"
              disabled={isSaving}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. 9876543210"
              className="h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md"
            />
            {fieldErrors.contact && (
              <span className="text-[10.5px] text-red-500 font-medium">{fieldErrors.contact}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-850 mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onClose}
              className="h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 text-xs px-4 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 text-white font-medium"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                "Save Driver"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
