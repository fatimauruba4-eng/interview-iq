"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import {
  Mic,
  Sparkles,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

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

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [questionCount, setQuestionCount] = useState("5");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [completed, setCompleted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [interviewAnswers, setInterviewAnswers] = useState<
    InterviewAnswer[]
  >([]);

  const handleInterview = async () => {
    if (!role.trim()) {
      alert("Please enter a job role");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          experience,
          questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.code === "AI_QUOTA_EXHAUSTED") {
          throw new Error(
            "AI interview is temporarily unavailable because the AI usage limit has been reached. Please try again later."
          );
        }

        throw new Error(
          data?.error || "Failed to generate interview"
        );
      }

      setResult(data.result);

      const questionList = data.result
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line !== "");

      setQuestions(questionList);
      setCurrentQuestion(0);
      setAnswer("");
      setFeedback("");
      setCompleted(false);
      setInterviewAnswers([]);
    } catch (error) {
      console.error("Interview generation error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the interview."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer");
      return;
    }

    if (!questions[currentQuestion]) {
      alert("Question not found");
      return;
    }

    try {
      setFeedbackLoading(true);

      const response = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questions[currentQuestion],
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.code === "AI_QUOTA_EXHAUSTED") {
          throw new Error(
            "AI feedback is temporarily unavailable because the AI usage limit has been reached. Please try again later."
          );
        }

        if (data?.code === "AI_SERVICE_BUSY") {
          throw new Error(
            "AI service is temporarily busy. Please try again in a moment."
          );
        }

        throw new Error(
          data?.error || "Failed to get feedback"
        );
      }

      setFeedback(data.feedback || "");
    } catch (error) {
      console.error("Feedback error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to get feedback"
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  const extractScore = (feedbackText: string) => {
    const match = feedbackText.match(
      /Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i
    );

    if (!match) {
      return 0;
    }

    return Number(match[1]);
  };

  const saveInterview = async (finalAnswers: InterviewAnswer[]) => {
    if (finalAnswers.length === 0) {
      alert("No interview answers found.");
      return false;
    }

    try {
      setSaving(true);

      const totalScore = finalAnswers.reduce(
        (total, item) => total + item.score,
        0
      );

      const averageScore = Math.round(
        totalScore / finalAnswers.length
      );

      const combinedFeedback = finalAnswers
        .map(
          (item, index) =>
            `Question ${index + 1}\n\n${item.feedback}`
        )
        .join("\n\n--------------------\n\n");

      const payload = {
        role: role.trim(),
        experience,
        questions,
        answers: finalAnswers,
        score: averageScore,
        feedback: combinedFeedback,
      };

      console.log("Saving interview:", payload);

      const response = await fetch("/api/interview-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Save interview response:", data);

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "Failed to save interview"
        );
      }

      if (!data?.success) {
        throw new Error("Interview was not saved.");
      }

      setCompleted(true);

      return true;
    } catch (error) {
      console.error("SAVE INTERVIEW ERROR:", error);

      alert(
        `Interview completed, but saving failed.\n\n${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer");
      return;
    }

    if (!feedback.trim()) {
      alert("Please submit your answer and wait for AI feedback first.");
      return;
    }

    const currentAnswer: InterviewAnswer = {
      question: questions[currentQuestion],
      answer: answer.trim(),
      feedback,
      score: extractScore(feedback),
    };

    const finalAnswers = [
      ...interviewAnswers,
      currentAnswer,
    ];

    setInterviewAnswers(finalAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer("");
      setFeedback("");
    } else {
      await saveInterview(finalAnswers);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen flex-1 bg-[#F3F3F1] p-8`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]">
              <Mic size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-medium tracking-tight text-[#444]">
                AI Interview
              </h1>

              <p className="mt-1 text-sm text-[#999]">
                Practice interviews and get AI feedback.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#666]">
                Job Role
              </label>

              <input
                type="text"
                placeholder="Frontend Developer"
                className="w-full rounded-xl border border-[#DCDCD9] bg-[#FAFAF9] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#666]">
                Experience
              </label>

              <select
                className="w-full rounded-xl border border-[#DCDCD9] bg-[#FAFAF9] p-3.5 text-sm text-[#555] outline-none focus:border-[#BDBDBA]"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="Fresher">Fresher</option>
                <option value="Intermediate">
                  Intermediate
                </option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#666]">
                Number of Questions
              </label>

              <select
                className="w-full rounded-xl border border-[#DCDCD9] bg-[#FAFAF9] p-3.5 text-sm text-[#555] outline-none focus:border-[#BDBDBA]"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(e.target.value)
                }
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>

            <button
              onClick={handleInterview}
              disabled={loading || saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D5D5D2] bg-[#EDEDEB] py-3.5 text-sm font-medium text-[#555] transition hover:bg-[#E5E5E2] disabled:cursor-not-allowed disabled:bg-[#E5E5E2] disabled:text-[#999]"
            >
              <Sparkles size={16} />
              {loading ? "Generating..." : "Start Interview"}
            </button>
          </div>

          {questions.length > 0 && !completed && (
            <div className="mt-6 rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                    <MessageSquare size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-[#999]">
                      Current Question
                    </p>

                    <h2 className="text-lg font-medium text-[#555]">
                      Question {currentQuestion + 1}
                    </h2>
                  </div>
                </div>

                <span className="text-xs text-[#999]">
                  {currentQuestion + 1} / {questions.length}
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-[#EEEEEB] p-5">
                <p className="text-[15px] leading-7 text-[#666]">
                  {questions[currentQuestion]}
                </p>
              </div>

              <textarea
                className="mt-5 w-full resize-none rounded-2xl border border-[#DCDCD9] bg-[#FAFAF9] p-4 text-sm leading-6 text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
                rows={6}
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

              <button
                onClick={handleSubmitAnswer}
                disabled={feedbackLoading || saving}
                className="mt-4 flex items-center gap-2 rounded-xl border border-[#D5D5D2] bg-[#EDEDEB] px-5 py-3 text-sm font-medium text-[#555] transition hover:bg-[#E5E5E2] disabled:cursor-not-allowed disabled:text-[#999]"
              >
                <Sparkles size={15} />

                {feedbackLoading
                  ? "Checking..."
                  : "Submit Answer"}
              </button>

              {feedback && (
                <div className="mt-6 border-t border-[#E2E2DF] pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7E7E4] text-[#666]">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-[#555]">
                        AI Feedback
                      </h2>

                      <p className="text-sm text-[#999]">
                        Feedback on your answer
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#EEEEEB] p-5">
                    <p className="whitespace-pre-line text-sm leading-7 text-[#666]">
                      {feedback}
                    </p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={saving}
                    className="mt-5 rounded-xl border border-[#D5D5D2] bg-[#EDEDEB] px-5 py-3 text-sm font-medium text-[#555] transition hover:bg-[#E5E5E2] disabled:cursor-not-allowed disabled:text-[#999]"
                  >
                    {saving
                      ? "Saving Interview..."
                      : currentQuestion <
                        questions.length - 1
                      ? "Next Question"
                      : "Complete Interview"}
                  </button>
                </div>
              )}
            </div>
          )}

          {completed && (
            <div className="mt-6 rounded-2xl border border-[#E2E2DF] bg-[#F1F1EF] p-7 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E5E5E2] text-[#666]">
                <CheckCircle2 size={22} />
              </div>

              <h2 className="mt-4 text-xl font-medium text-[#555]">
                Interview Completed
              </h2>

              <p className="mt-2 text-sm text-[#999]">
                Great job! Your interview result has been saved.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}