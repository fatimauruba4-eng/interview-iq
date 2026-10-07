"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import {
  ArrowUpRight,
  Star,
  Sparkles,
  Users,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type DashboardStats = {
  completed: number;
  score: number;
  active: number;
};

const avatars = [
  "https://i.pravatar.cc/100?img=12",
  "https://i.pravatar.cc/100?img=32",
  "https://i.pravatar.cc/100?img=47",
  "https://i.pravatar.cc/100?img=56",
  "https://i.pravatar.cc/100?img=68",
];

function AvatarStack() {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {avatars.slice(0, 4).map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt=""
            className="h-7 w-7 rounded-full border-2 border-white object-cover"
          />
        ))}
      </div>

      <div className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-semibold text-gray-600">
        +6
      </div>
    </div>
  );
}

export default function DashboardMain() {
  const { user } = useUser();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    completed: 0,
    score: 0,
    active: 0,
  });

  const [loading, setLoading] = useState(true);

  const getDashboard = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        console.log("Dashboard: Clerk token unavailable");
        return;
      }

      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        console.log("Dashboard API error:", response.status);
        return;
      }

      const data = await response.json();

      setStats({
        completed: Number(data.completed) || 0,
        score: Number(data.score) || 0,
        active: Number(data.active) || 0,
      });
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  useEffect(() => {
    const refresh = () => {
      getDashboard();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    const interval = window.setInterval(() => {
      getDashboard();
    }, 30000);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(interval);
    };
  }, [getDashboard]);

  const score = Math.min(Math.max(stats.score, 0), 100);

  return (
    <main
      className={`${poppins.className} min-h-0 flex-1 overflow-y-auto bg-[#f5f5f3] px-8 py-7`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto w-full max-w-[820px]">
        <div>
          <h1 className="text-[39px] font-semibold leading-none tracking-[-1.8px] text-[#151515]">
            Welcome back 👋
          </h1>
        </div>

        <div className="mt-9 flex items-center gap-3">
          <h2 className="text-[27px] font-semibold tracking-[-1px]">
            Your activities today
          </h2>

          <span className="text-[23px] font-medium text-gray-400">
            ({loading ? "..." : stats.active})
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <Link href="/resumeanalyzer">
            <div className="group relative h-[118px] overflow-hidden rounded-[24px] bg-[#cfe4e4] p-4 transition duration-300 hover:-translate-y-1">
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold">
                <Star size={10} fill="#e7c85d" strokeWidth={0} />
                4.9
              </div>

              <div className="absolute left-4 top-[51px]">
                <AvatarStack />
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="text-[21px] font-semibold tracking-[-0.5px]">
                    Resume Analyzer
                  </h3>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white transition group-hover:rotate-45">
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/interview">
            <div className="group relative h-[118px] overflow-hidden rounded-[24px] bg-[#f4c7df] p-4 transition duration-300 hover:-translate-y-1">
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold">
                <Star size={10} fill="#e7c85d" strokeWidth={0} />
                4.8
              </div>

              <div className="absolute left-4 top-[51px]">
                <AvatarStack />
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="text-[21px] font-semibold tracking-[-0.5px]">
                    AI Interview
                  </h3>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white transition group-hover:rotate-45">
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-7">
          <h2 className="text-[27px] font-semibold tracking-[-1px]">
            Interview progress
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="h-[92px] rounded-[21px] bg-[#cfe4e4] p-4">
            <div className="flex items-start justify-between">
              <p className="text-[14px] font-normal text-gray-600">
                Completed
              </p>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <ArrowUpRight size={12} />
              </div>
            </div>

            <h3 className="mt-2.5 text-[30px] font-medium leading-none">
              {loading ? "—" : stats.completed}
            </h3>
          </div>

          <div className="h-[92px] rounded-[21px] bg-[#f7e2a8] p-4">
            <div className="flex items-start justify-between">
              <p className="text-[14px] font-normal text-gray-600">
                Your score
              </p>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <ArrowUpRight size={12} />
              </div>
            </div>

            <h3 className="mt-2.5 text-[30px] font-medium leading-none">
              {loading ? "—" : stats.score}
            </h3>
          </div>

          <div className="h-[92px] rounded-[21px] bg-[#d9c9e9] p-4">
            <div className="flex items-start justify-between">
              <p className="text-[14px] font-normal text-gray-600">
                Active
              </p>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <ArrowUpRight size={12} />
              </div>
            </div>

            <h3 className="mt-2.5 text-[30px] font-medium leading-none">
              {loading ? "—" : stats.active}
            </h3>
          </div>
        </div>

        <div className="mt-3 rounded-[24px] bg-[#f7dfa0] px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Sparkles size={13} />
                </div>

                <span className="text-[13px] font-semibold text-[#151515]">
                  Interview Skills
                </span>
              </div>

              <p className="mt-2 text-[12px] font-medium text-gray-600">
                Technical Interview
              </p>

              <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.5px] text-[#151515]">
                Technical Interview
              </h3>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <ArrowUpRight size={13} />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-600">
              Progress
            </span>

            <span className="text-[11px] font-semibold text-[#151515]">
              {loading ? "—" : `${score}%`}
            </span>
          </div>

          <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-[#e6ce82]">
            <div
              className="h-full rounded-full bg-black transition-all duration-700"
              style={{
                width: loading ? "0%" : `${score}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3 w-full rounded-[24px] bg-[#f4c7df] px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <Users size={16} />
              </div>

              <div>
                <p className="text-[14px] font-semibold tracking-[-0.3px] text-[#151515]">
                  Many candidates are on this path
                </p>

                <p className="mt-1 text-[12px] text-gray-600">
                  Resume → Practice → Improve → Interview-ready
                </p>
              </div>
            </div>

            <div className="flex -space-x-2">
              {avatars.slice(0, 4).map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-[#f4c7df] object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}