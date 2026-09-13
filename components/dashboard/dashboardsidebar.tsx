"use client";

import {
  FileText,
  Settings,
  BookOpen,
  History,
  User,
  Mic,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    href: "/resumeanalyzer",
    icon: FileText,
    label: "Resume Analyzer",
  },
  {
    href: "/dashboard/interview",
    icon: Mic,
    label: "AI Interview",
  },
  {
    href: "/dashboard/question-bank",
    icon: BookOpen,
    label: "Question Bank",
  },
  {
    href: "/dashboard/interview-history",
    icon: History,
    label: "Interview History",
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
  {
    href: "/dashboard/profile",
    icon: User,
    label: "Profile",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-full w-[90px] shrink-0 flex-col items-center border-r border-gray-100 bg-white">
      <div className="flex w-full justify-center pt-[1.5cm]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-2xl font-bold text-white shadow-sm">
          I
        </div>
      </div>

      <nav className="flex flex-col items-center gap-[calc(48px-0.5cm)] pt-[2cm]">
        {routes.map((route) => {
          const Icon = route.icon;

          const isActive =
            pathname === route.href ||
            (route.href !== "/resumeanalyzer" &&
              pathname.startsWith(route.href));

          const isProfile = route.href === "/dashboard/profile";
          const isAnalytics = route.href === "/dashboard/analytics";

          return (
            <Link
              key={route.href}
              href={route.href}
              title={route.label}
              className={`group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${
                isProfile
                  ? "-mt-[0.5cm] translate-y-[1cm]"
                  : isAnalytics
                    ? "mb-[-0.5cm]"
                    : ""
              } ${
                isActive
                  ? "bg-black text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon size={27} strokeWidth={2} />

              <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                {route.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 -mt-[3cm] w-full bg-white pb-7 pt-0">
        <Link
          href="/dashboard/settings"
          title="Settings"
          className={`group relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
            pathname === "/dashboard/settings"
              ? "bg-black text-white shadow-md"
              : "text-gray-500 hover:bg-gray-100 hover:text-black"
          }`}
        >
          <Settings size={27} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}