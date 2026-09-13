import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: interviews, error } = await supabaseAdmin
      .from("interview_history")
      .select("score, questions, answers, created_at")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Analytics database error:", error);

      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    const totalInterviews = interviews?.length ?? 0;

    const scores = (interviews ?? [])
      .map((interview) => Number(interview.score))
      .filter((score) => !Number.isNaN(score));

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    let questionAnswered = 0;

    for (const interview of interviews ?? []) {
      if (Array.isArray(interview.answers)) {
        questionAnswered += interview.answers.length;
      } else if (Array.isArray(interview.questions)) {
        questionAnswered += interview.questions.length;
      }
    }

    let progress = "0%";

    if (scores.length >= 2) {
      const firstScore = scores[0];
      const latestScore = scores[scores.length - 1];

      if (firstScore > 0) {
        const improvement =
          ((latestScore - firstScore) / firstScore) * 100;

        progress = `${Math.round(improvement)}%`;
      }
    } else if (scores.length === 1) {
      progress = "0%";
    }

    return NextResponse.json({
      analytics: {
        TotalInterview: totalInterviews,
        AverageScore:
          scores.length > 0
            ? `${averageScore.toFixed(1)}/10`
            : "-",
        Progress: progress,
        QuestionAnswered: String(questionAnswered),
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}