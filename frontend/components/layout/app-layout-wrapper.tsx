"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SidebarLayout from "./sidebar-layout";
import { Toaster } from "sonner";
import { SettingsProvider } from "@/hooks/use-settings";

import { ThemeProvider } from "next-themes";

export default function AppLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  if (isLoginPage) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <SettingsProvider>
          {children}
          <Toaster position="top-right" closeButton />
        </SettingsProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SettingsProvider>
        <SidebarLayout>
          {children}
          <Toaster position="top-right" closeButton />
        </SidebarLayout>
      </SettingsProvider>
    </ThemeProvider>
  );
}
