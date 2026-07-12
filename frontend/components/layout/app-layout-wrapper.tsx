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
<<<<<<< HEAD
      <SettingsProvider>
        {children}
        <Toaster position="top-right" closeButton />
      </SettingsProvider>
=======
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
        <Toaster position="top-right" closeButton />
      </ThemeProvider>
>>>>>>> e21c9cd41bb78a6b7cb495efd05d19b93ba7c434
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SidebarLayout>
        {children}
        <Toaster position="top-right" closeButton />
      </SidebarLayout>
    </ThemeProvider>
  );
}
