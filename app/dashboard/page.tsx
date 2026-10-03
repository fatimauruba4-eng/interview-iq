"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import DashboardMobileSidebar from "@/components/ui/dashboardmobilesidebar";
import DashboardSidebar from "@/components/dashboard/dashboardsidebar";
import DashboardRightPanel from "@/components/dashboard/DashboardRightPanel";
import DashboardMain from "@/components/dashboard/DashboardMain";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    console.log("CLERK CLIENT FINAL:", {
      isLoaded,
      isSignedIn,
      userId,
    });
  }, [isLoaded, isSignedIn, userId]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-5 pt-[92px] pb-[60px]"
      style={{ backgroundImage: "url('/dashboard-bg.png')" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-152px)] w-[86%] max-w-[1320px] overflow-hidden rounded-[40px] bg-[#f5f5f3]/95 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <DashboardMobileSidebar />
        <DashboardSidebar />
        <DashboardMain />
        <DashboardRightPanel />
      </div>
    </div>
  );
}
