
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

    const { data: history, error } = await supabase
      .from("interview_history")
      .select(
        "id, clerk_id, role, experience, questions, answers, score, feedback, created_at"
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Interview history Supabase error:", error);

      return NextResponse.json(
        { error: "Failed to fetch interview history", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      history: history || [],
    });
  } catch (error) {
    console.error("Interview history API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

