"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { BottomNav, DrawerMenu } from "@/components/layout";
import { DrawerProvider } from "@/components/layout/DrawerContext";
import { LoadingScreen } from "@/components/ui/Spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
    }
  }, [user, router]);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <DrawerProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </DrawerProvider>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <DrawerMenu />
      <main className="min-h-screen">{children}</main>
      <BottomNav />
    </div>
  );
}
