import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabaseAdmin";

export async function GET() {
try {
const { userId } = await auth();


if (!userId) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const { data: interviews, error } = await supabase
  .from("interview_history")
  .select("score, created_at")
  .eq("clerk_id", userId);

if (error) {
  console.error("Dashboard Supabase error:", error);

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}

const interviewData = interviews || [];

const completed = interviewData.length;

const scores = interviewData
  .map((interview) => Number(interview.score))
  .filter((score) => Number.isFinite(score));

const score =
  scores.length > 0
    ? Math.round(
        scores.reduce((total, current) => total + current, 0) /
          scores.length
      )
    : 0;

const active = 0;

return NextResponse.json({
  completed,
  score,
  active,
});


} catch (error) {
console.error("Dashboard API error:", error);


return NextResponse.json(
  { error: "Something went wrong" },
  { status: 500 }
);


}
}
