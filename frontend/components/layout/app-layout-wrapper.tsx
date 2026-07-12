"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SidebarLayout from "./sidebar-layout";
import { Toaster } from "sonner";
import { SettingsProvider } from "@/hooks/use-settings";

export default function AppLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  if (isLoginPage) {
    return (
      <SettingsProvider>
        {children}
        <Toaster position="top-right" closeButton />
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <SidebarLayout>
        {children}
        <Toaster position="top-right" closeButton />
      </SidebarLayout>
    </SettingsProvider>
  );
}
