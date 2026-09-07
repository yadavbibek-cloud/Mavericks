"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/map-explorer");
  }, [router]);

  return (
    <div className="min-h-screen bg-gs-bg-primary flex items-center justify-center text-gs-text-secondary font-mono text-xs">
      Redirecting to GridSense Map Explorer & Digital Twin...
    </div>
  );
}