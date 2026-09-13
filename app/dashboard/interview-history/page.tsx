"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { History, CalendarDays, Trophy } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type InterviewAnswer = {
  question: string;
  answer: string;
  feedback: string;
  score: number;
};

type Interview = {
  id: string;
  clerk_id: string;
  role: string;
  experience: string;
  questions: string[];
  answers: InterviewAnswer[];
  score: number;
  feedback: string;
  created_at: string;
};

export default function InterviewHistory() {
  const [history, setHistory] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selected = history.find(
    (item) => item.id === selectedInterview
  );

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/interview-history", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.details ||
              data?.error ||
              "Failed to fetch interview history"
          );
        }

        const interviews = Array.isArray(data.history)
          ? data.history
          : [];

        setHistory(interviews);

        if (interviews.length > 0) {
          setSelectedInterview(interviews[0].id);
        }
      } catch (err) {
        console.error("Interview history error:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load interview history.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main
      className={`${poppins.className} min-h-screen flex-1 bg-[#F3F3F1] p-8`}
    >
      <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]">
            <History size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#444]">
              Interview History
            </h1>

            <p className="mt-1 text-sm text-[#999]">
              View your previous interview sessions and scores
            </p>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6 text-center">
            <p className="text-sm text-[#888]">
              Loading interview history...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6 text-center">
            <p className="text-sm text-[#888]">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#D4D4D1] bg-[#F5F5F3] p-10 text-center">
            <History size={28} className="mx-auto text-[#999]" />

            <p className="mt-4 text-sm text-[#888]">
              No interview history yet.
            </p>

            <p className="mt-1 text-xs text-[#AAA]">
              Complete an AI interview to see your results here.
            </p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <>
            <div className="mt-8 space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedInterview(item.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    selectedInterview === item.id
                      ? "border-[#BDBDBA] bg-[#EEEEEB]"
                      : "border-[#E2E2DF] bg-[#F5F5F3] hover:bg-[#EFEFED]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5E5E2] text-[#666]">
                        <Trophy size={19} />
                      </div>

                      <div>
                        <h2 className="text-base font-medium text-[#555]">
                          {item.role}
                        </h2>

                        <div className="mt-1 flex items-center gap-2 text-xs text-[#999]">
                          <CalendarDays size={13} />

                          <span>
                            {formatDate(item.created_at)} at{" "}
                            {formatTime(item.created_at)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[#AAA]">
                          {item.experience}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#999]">
                        Score
                      </p>

                      <p className="mt-1 text-lg font-medium text-[#555]">
                        {Number(item.score).toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="mt-8 border-t border-[#E2E2DF] pt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                    <History size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-[#555]">
                      Interview Details
                    </h2>

                    <p className="text-sm text-[#999]">
                      Review your interview performance
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#F1F1EF] p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-[#999]">
                        Role
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#555]">
                        {selected.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#999]">
                        Experience
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#555]">
                        {selected.experience}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#999]">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#555]">
                        {formatDate(selected.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#999]">
                        Score
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#555]">
                        {Number(selected.score).toFixed(1)}/10
                      </p>
                    </div>
                  </div>

                  {selected.feedback && (
                    <div className="mt-6 border-t border-[#E2E2DF] pt-5">
                      <p className="text-xs text-[#999]">
                        Overall Feedback
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#666]">
                        {selected.feedback}
                      </p>
                    </div>
                  )}

                  {Array.isArray(selected.answers) &&
                    selected.answers.length > 0 && (
                      <div className="mt-6 border-t border-[#E2E2DF] pt-5">
                        <p className="text-xs text-[#999]">
                          Interview Answers
                        </p>

                        <div className="mt-4 space-y-4">
                          {selected.answers.map(
                            (answer, index) => (
                              <div
                                key={index}
                                className="rounded-xl bg-[#E8E8E5] p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <p className="text-sm font-medium text-[#555]">
                                    {index + 1}.{" "}
                                    {answer.question}
                                  </p>

                                  <span className="shrink-0 text-sm font-medium text-[#666]">
                                    {Number(answer.score).toFixed(
                                      1
                                    )}
                                    /10
                                  </span>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-[#777]">
                                  {answer.answer}
                                </p>

                                {answer.feedback && (
                                  <p className="mt-3 whitespace-pre-line text-xs leading-5 text-[#999]">
                                    {answer.feedback}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}