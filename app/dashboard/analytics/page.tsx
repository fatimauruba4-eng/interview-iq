"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import {
  BarChart3,
  BriefcaseBusiness,
  Target,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type Analytics = {
  TotalInterview: number;
  AverageScore: string;
  Progress: string;
  QuestionAnswered: string;
};

export default function InterviewFunction() {
  const [analyticsData, setAnalyticsData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchAnalytics() {
      setLoading(true);

      try {
        const response = await fetch("/api/analytics");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (active) {
          setAnalyticsData(data.analytics);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchAnalytics();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main
      className={`${poppins.className} min-h-screen flex-1 bg-[#F3F3F1] p-8`}
    >
      <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]">
            <BarChart3 size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#444]">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-[#999]">
              Track your interview performance and progress.
            </p>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6 text-center">
            <p className="text-sm text-[#888]">Loading analytics...</p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                <BriefcaseBusiness size={18} />
              </div>

              <span className="text-xs text-[#999]">Interviews</span>
            </div>

            <p className="mt-6 text-sm font-medium text-[#777]">
              Total Interviews
            </p>

            <p className="mt-1 text-3xl font-medium text-[#444]">
              {analyticsData?.TotalInterview ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                <Target size={18} />
              </div>

              <span className="text-xs text-[#999]">Performance</span>
            </div>

            <p className="mt-6 text-sm font-medium text-[#777]">
              Average Score
            </p>

            <p className="mt-1 text-3xl font-medium text-[#444]">
              {analyticsData?.AverageScore ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                <TrendingUp size={18} />
              </div>

              <span className="text-xs text-[#999]">Growth</span>
            </div>

            <p className="mt-6 text-sm font-medium text-[#777]">
              Progress
            </p>

            <p className="mt-1 text-3xl font-medium text-[#444]">
              {analyticsData?.Progress ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                <MessageSquare size={18} />
              </div>

              <span className="text-xs text-[#999]">Practice</span>
            </div>

            <p className="mt-6 text-sm font-medium text-[#777]">
              Questions Answered
            </p>

            <p className="mt-1 text-3xl font-medium text-[#444]">
              {analyticsData?.QuestionAnswered ?? "0"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}