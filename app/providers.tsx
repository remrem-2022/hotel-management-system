"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { ToastContainer } from "@/components/ui/Toast";
import { LoadingScreen } from "@/components/ui/Spinner";
import { initializeDatabase, seedService } from "@/services";

export function Providers({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, isLoading } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const [isDbInitialized, setIsDbInitialized] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      try {
        // Initialize database
        await initializeDatabase();

        // Seed database if needed
        const isSeeded = await seedService.isDatabaseSeeded();
        if (!isSeeded) {
          await seedService.seedDatabase();
        }

        setIsDbInitialized(true);

        // Initialize auth
        await initialize();
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsDbInitialized(true);
      }
    }

    init();
  }, [initialize]);

  // Apply theme on mount
  React.useEffect(() => {
    useThemeStore.getState().setTheme(theme);
  }, [theme]);

  if (isLoading || !isInitialized || !isDbInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
