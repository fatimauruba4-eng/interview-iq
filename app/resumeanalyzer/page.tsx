"use client";

import { useState } from "react";

import { Poppins } from "next/font/google";

import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult("");

    if (!file) {
      alert("Please submit a file to continue");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/resumeanalyzer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.code === "AI_QUOTA_EXHAUSTED") {
          throw new Error(
            "AI resume analysis is temporarily unavailable because the AI usage limit has been reached. Please try again later."
          );
        }

        throw new Error(data?.error || "Failed to analyze resume");
      }

      setResult(data.result);
    } catch (error) {
      console.log(error);

      setResult(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing your resume."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F3F3F1] p-8`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]">
              <FileText size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-medium tracking-tight text-[#444]">
                Resume Analyzer
              </h1>

              <p className="mt-1 text-sm text-[#999]">
                Get AI-powered feedback on your resume
              </p>
            </div>
          </div>

          <label className="group mt-8 flex h-60 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[#D4D4D1] bg-[#F5F5F3] transition hover:border-[#AFAFAD] hover:bg-[#F1F1EF]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8E8E5] text-[#777] transition group-hover:bg-[#E1E1DE]">
              <Upload size={21} />
            </div>

            <h2 className="mt-5 text-base font-medium text-[#555]">
              {file ? file.name : "Upload your resume"}
            </h2>

            <p className="mt-2 text-sm text-[#999]">
              {file
                ? "Your resume is ready to analyze"
                : "PDF files only · Click to browse"}
            </p>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>

          {file && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#E2E2DF] bg-[#F1F1EF] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3E3E0] text-[#666]">
                  <FileText size={17} />
                </div>

                <div>
                  <p className="max-w-[500px] truncate text-sm font-medium text-[#555]">
                    {file.name}
                  </p>

                  <p className="text-xs text-[#999]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <CheckCircle2
                size={18}
                className="text-[#777]"
              />
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D8D8D5] bg-[#EDEDEB] py-3.5 text-sm font-medium text-[#555] transition hover:bg-[#E5E5E2] disabled:cursor-not-allowed disabled:bg-[#E5E5E2] disabled:text-[#999]"
          >
            <Sparkles size={16} />

            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>

          {result && (
            <div className="mt-8 border-t border-[#E2E2DF] pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-medium text-[#555]">
                    Analysis Result
                  </h2>

                  <p className="text-sm text-[#999]">
                    AI-generated feedback
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#F1F1EF] p-6">
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#666]">
                  {result}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}