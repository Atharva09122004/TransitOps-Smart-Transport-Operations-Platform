"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Truck } from "lucide-react";
import { login } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<string | null>("DRIVER"); // Default role helper
  const [showPassword, setShowPassword] = React.useState(false);

  // Status states
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);

    // Form validation
    if (!email) {
      setErrorMsg("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      // Call auth service (matching POST /api/auth/login contract)
      const res = await login({ email, password });

      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          localStorage.setItem("userRole", res.user.role);
          localStorage.setItem("userName", res.user.displayName || res.user.email);
        }

        toast.success(res.message || "Login successful. Redirecting...", {
          duration: 1500,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMsg(res.message || "Login failed");
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as any;

        if (status === 400) {
          setErrorMsg(data?.message || "Invalid request");
        } else if (status === 401) {
          setErrorMsg("Invalid credentials");
        } else if (status === 403) {
          setErrorMsg("Account is inactive");
        } else if (status === 404) {
          setErrorMsg("User not found");
        } else if (status === 423) {
          setErrorMsg("Account locked for 15 minutes");
        } else {
          setErrorMsg(data?.message || "An unexpected error occurred. Please try again.");
        }
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 font-sans overflow-hidden">
      <Toaster position="top-right" closeButton />

      {/* LEFT SIDE PANEL (Clean, Corporate Slate Panel) */}
      <div className="hidden md:flex md:w-[35%] bg-[#0B0C0E] text-white flex-col justify-between p-12 border-r border-zinc-900 relative">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="size-6 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <Truck className="size-3.5 text-zinc-100" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">TransitOps</span>
        </div>

        {/* Feature board */}
        <div className="space-y-8 my-auto max-w-xs">
          <div className="space-y-2.5">
            <h2 className="text-2xl font-light tracking-tight leading-snug text-zinc-100">
              Smart Transport <br />
              <span className="font-semibold text-white">Operations Platform</span>
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed font-light">
              Manage vehicles, driver metrics, routes, and ROI analytics in one integrated dashboard.
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-900 space-y-4">
            {[
              { label: "Fleet Management", desc: "Vehicle health tracking and service scheduling" },
              { label: "Dispatch Operations", desc: "Trip lifecycles, payload weights, and routing" },
              { label: "Safety & Compliance", desc: "Driver license validation and safety scoring" },
              { label: "Financial Analysis", desc: "Fuel consumption tracking and ROI calculations" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-[10px] font-mono text-zinc-600 mt-0.5">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 block">{item.label}</span>
                  <span className="text-[10.5px] text-zinc-500 font-light leading-relaxed">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-zinc-600 font-mono">
          <span>TransitOps © 2026</span>
        </div>
      </div>

      {/* RIGHT SIDE PANEL (Clean, Premium Minimal Sign-In Form) */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-[350px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              Sign in
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Enter your credentials to continue
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50/50 dark:bg-red-950/10 p-2.5 rounded border border-red-100 dark:border-red-900/20">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Email Address
              </label>
              <Input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-10 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Password recovery is unavailable in this workspace.");
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-9 h-10 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md transition-all duration-200"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Access Role select mapping */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Access Role
              </label>
              <div className="relative w-full">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full h-10 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm pl-3.5 focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-950/5 rounded-md">
                    <SelectValue placeholder="Select operational role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                    <SelectItem value="FLEET_MANAGER">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">Fleet Manager</span>
                    </SelectItem>
                    <SelectItem value="DRIVER">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">Dispatcher</span>
                    </SelectItem>
                    <SelectItem value="SAFETY_OFFICER">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">Safety Officer</span>
                    </SelectItem>
                    <SelectItem value="FINANCIAL_ANALYST">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">Financial Analyst</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-3 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 hover:bg-zinc-800 active:scale-[0.985] text-white text-[10px] font-semibold uppercase tracking-widest border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-150 flex items-center justify-center gap-2 rounded-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
