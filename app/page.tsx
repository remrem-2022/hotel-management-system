"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LoadingScreen } from "@/components/ui/Spinner";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/sign-in");
    }
  }, [user, router]);

  return <LoadingScreen />;
}
