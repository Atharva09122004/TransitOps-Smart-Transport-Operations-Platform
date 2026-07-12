"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SidebarLayout from "./sidebar-layout";
import { Toaster } from "sonner";

export default function AppLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster position="top-right" closeButton />
      </>
    );
  }

  return (
    <SidebarLayout>
      {children}
      <Toaster position="top-right" closeButton />
    </SidebarLayout>
  );
}
