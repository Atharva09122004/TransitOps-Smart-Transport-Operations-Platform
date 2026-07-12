"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Truck,
  Shield,
  TrendingUp,
  Wrench,
  Fuel,
  Settings,
  LogOut,
  User,
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fleet", href: "/dashboard/fleet", icon: Truck },
  { name: "Drivers", href: "/dashboard/drivers", icon: User },
  { name: "Trips", href: "/dashboard/trips", icon: Compass },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Fuel & Expenses", href: "/dashboard/fuel", icon: Fuel },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Settings", href: "/dashboard/settings", icon: Settings }
];

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Read session values from localStorage
  const [userName, setUserName] = React.useState("Raven K.");
  const [userEmail, setUserEmail] = React.useState("manager@transitops.com");
  const [userRole, setUserRole] = React.useState("FLEET_MANAGER");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const storedRole = localStorage.getItem("userRole");
      const storedToken = localStorage.getItem("token");

      // Simple auth guard check
      if (!storedToken) {
        toast.error("Session expired. Please sign in again.");
        router.push("/login");
        return;
      }

      if (storedName) setUserName(storedName);
      if (storedEmail) setUserEmail(storedEmail);
      if (storedRole) setUserRole(storedRole);
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "FLEET_MANAGER":
        return "Fleet Manager";
      case "DRIVER":
        return "Dispatcher";
      case "SAFETY_OFFICER":
        return "Safety Officer";
      case "FINANCIAL_ANALYST":
        return "Finance Analyst";
      default:
        return "User";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Toaster position="top-right" closeButton />

      {/* MOBILE HEADER BAR */}
      <div className="flex md:hidden h-14 w-full bg-zinc-900 border-b border-zinc-800 items-center justify-between px-4 absolute top-0 left-0 z-40 text-white">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-amber-500" />
          <span className="font-semibold text-sm tracking-tight">TransitOps</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          {isMobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (Shared component) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0B0C0E] border-r border-zinc-900 flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="size-6 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
              <Truck className="size-3.5 text-zinc-100" />
            </div>
            <span className="text-sm font-semibold tracking-wider text-white">TransitOps</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-zinc-850 text-white font-semibold shadow-inner"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="pt-4 border-t border-zinc-900 space-y-3.5">
          <div className="flex items-center gap-3 px-2">
            <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="size-4 text-zinc-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-zinc-200 truncate">{userName}</span>
              <span className="text-[10px] text-zinc-500 font-mono truncate">
                {getRoleBadge(userRole)}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden pt-14 md:pt-0">
        {/* Header Search & Details */}
        <header className="h-14 border-b border-zinc-250/60 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 flex items-center justify-between px-6 shrink-0 relative z-10 backdrop-blur-md">
          {/* Search bar helper */}
          <div className="relative max-w-xs w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search resource or logs..."
              className="h-8.5 w-full pl-9 pr-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-750 transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notification placeholder */}
            <button className="relative p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500 animate-pulse" />
            </button>

            {/* Quick profile badge */}
            <div className="flex items-center gap-2">
              <div className="size-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-[10px] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                {userName.slice(0, 2)}
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium hidden sm:inline">
                {userName}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Children */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
