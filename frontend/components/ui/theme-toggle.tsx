"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="size-8" />;

  const cycle = () => {
    if (resolvedTheme === "light") setTheme("dark");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycle}
      title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      className="relative p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all duration-200 group"
    >
      <span className="sr-only">Toggle theme</span>
      {resolvedTheme === "dark" ? (
        <Sun className="size-4 transition-transform duration-300 group-hover:rotate-12" />
      ) : (
        <Moon className="size-4 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
