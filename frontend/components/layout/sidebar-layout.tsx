"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Truck,
  Wrench,
  Fuel,
  LogOut,
  User,
  Search,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ui/theme-toggle";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: User },
  { name: "Trips", href: "/trips", icon: Compass },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Fuel & Expenses", href: "/fuel", icon: Fuel },
  { name: "Analytics", href: "/analytics", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings }
];

const ROLE_MENU_ITEMS: Record<string, string[]> = {
  FLEET_MANAGER: ["Vehicles", "Maintenance"],
  DISPATCHER: ["Dashboard", "Trips"],
  SAFETY_OFFICER: ["Drivers"],
  FINANCIAL_ANALYST: ["Fuel & Expenses", "Analytics"]
};

function normalizeRole(role: string | null | undefined) {
  const normalizedRole = (role || "").trim().toUpperCase();

  if (["FLEET_MANAGER", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(normalizedRole)) {
    return "FLEET_MANAGER";
  }

  if (["DRIVER", "DISPATCHER"].includes(normalizedRole)) {
    return "DISPATCHER";
  }

  if (["SAFETY_OFFICER", "SAFETY"].includes(normalizedRole)) {
    return "SAFETY_OFFICER";
  }

  if (["FINANCIAL_ANALYST", "FINANCE", "FINANCIAL"].includes(normalizedRole)) {
    return "FINANCIAL_ANALYST";
  }

  return "MEMBER";
}

const getStoredUserName = () => {
  if (typeof window === "undefined") return "User";
  return localStorage.getItem("userName") ?? "User";
};

const getStoredUserRole = () => {
  if (typeof window === "undefined") return "MEMBER";

  let resolvedRole = localStorage.getItem("userRole");
  const storedUser = localStorage.getItem("user");

  if (!resolvedRole && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && typeof parsedUser.role === "string") {
        resolvedRole = parsedUser.role;
      }
    } catch {
      resolvedRole = null;
    }
  }

  if (!resolvedRole) {
    resolvedRole = localStorage.getItem("selectedRole");
  }

  return normalizeRole(resolvedRole);
};

function getVisibleSidebarItems(role: string | null | undefined): SidebarItem[] {
  const normalizedRole = normalizeRole(role);
  const allowedItems = ROLE_MENU_ITEMS[normalizedRole] ?? SIDEBAR_ITEMS.map((item) => item.name);

  return SIDEBAR_ITEMS.filter((item) => allowedItems.includes(item.name));
}

function GlobalSearch({ items }: { items: SidebarItem[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const filtered = query.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const go = (href: string) => {
    router.push(href);
    setQuery("");
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      go(filtered[0].href);
    }
    if (e.key === "Escape") {
      setQuery("");
      setFocused(false);
    }
  };

  return (
    <div className="relative max-w-xs w-full hidden sm:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Search pages & resources..."
        className="h-8.5 w-full pl-9 pr-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
      />
      {focused && filtered.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onMouseDown={() => go(item.href)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <Icon className="size-3.5 text-zinc-400 shrink-0" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SidebarLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Read session values from localStorage when the component mounts on the client.
  const [userName] = React.useState(getStoredUserName);
  const [userRole] = React.useState(getStoredUserRole);
  const visibleSidebarItems = React.useMemo(() => getVisibleSidebarItems(userRole), [userRole]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        toast.error("Session expired. Please sign in again.");
        router.push("/login");
      }
    }
  }, [router]);

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const getRoleBadge = (role: string) => {
    switch (normalizeRole(role)) {
      case "FLEET_MANAGER":
        return "Fleet Manager";
      case "DISPATCHER":
        return "Dispatcher";
      case "SAFETY_OFFICER":
        return "Safety Officer";
      case "FINANCIAL_ANALYST":
        return "Financial Analyst";
      default:
        return "Team Member";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      
      {/* MOBILE HEADER BAR */}
      <div className="flex md:hidden h-14 w-full bg-zinc-900 border-b border-zinc-800 items-center justify-between px-4 fixed top-0 left-0 z-45 text-white">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-amber-500" />
          <span className="font-semibold text-sm tracking-tight">TransitOps</span>
        </div>
        <button
          onClick={handleSidebarToggle}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          {isMobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-[#0B0C0E] border-r border-zinc-900 flex flex-col justify-between p-6 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:w-64 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        } ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}`}
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
            {visibleSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-zinc-800 text-white font-semibold shadow-inner"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
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
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0 relative z-10">
          {/* Global Search bar */}
          <GlobalSearch items={visibleSidebarItems} />

          <div className="flex items-center gap-2 ml-auto">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick profile badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
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
