"use client";

import { useEffect, useState } from "react";

import { Poppins } from "next/font/google";

import {
  BookOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type Question = {
  id: number;
  questions: string;
  experience: string;
};

export default function QuestionBank() {
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("All");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.questions
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesExperience =
      experience === "All" ||
      question.experience.toLowerCase() === experience.toLowerCase();

    return matchesSearch && matchesExperience;
  });

  useEffect(() => {
    async function getQuestions() {
      setLoading(true);

      try {
        const response = await fetch("/api/question-bank");

        if (!response.ok) {
          console.error("Failed to fetch questions");
          return;
        }

        const data = await response.json();

        console.log("Question Bank API response:", data);

        if (Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    }

    getQuestions();
  }, []);

  return (
    <main
      className={`${poppins.className} min-h-screen flex-1 bg-[#F3F3F1] p-8`}
    >
      <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]">
            <BookOpen size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#444]">
              Question Bank
            </h1>

            <p className="mt-1 text-sm text-[#999]">
              Browse interview questions based on your experience level.
            </p>
          </div>
        </div>

        <div className="relative mt-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
          />

          <input
            className="w-full rounded-2xl border border-[#DCDCD9] bg-[#F5F5F3] py-3.5 pl-11 pr-4 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
            placeholder="Search questions..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <SlidersHorizontal
              size={15}
              className="text-[#888]"
            />

            <label className="text-sm font-medium text-[#666]">
              Experience Level
            </label>
          </div>

          <select
            className="w-full appearance-none rounded-2xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition focus:border-[#BDBDBA]"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Fresher">Fresher</option>
            <option value="Junior">Junior</option>
          </select>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-6 text-center">
            <p className="text-sm text-[#888]">
              Loading questions...
            </p>
          </div>
        )}

        {!loading && (
          <div className="mt-8 space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <div
                  key={question.id ?? index}
                  className="rounded-2xl border border-[#E2E2DF] bg-[#F5F5F3] p-5 transition hover:bg-[#EFEFED]"
                >
                  <div>
                    <h2 className="text-base font-medium leading-6 text-[#555]">
                      {question.questions}
                    </h2>

                    <div className="mt-3 flex gap-3 text-xs text-[#999]">
                      <span>
                        Experience: {question.experience}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D4D4D1] bg-[#F5F5F3] p-10 text-center">
                <Search
                  size={25}
                  className="mx-auto text-[#999]"
                />

                <p className="mt-4 text-sm text-[#888]">
                  No questions found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}