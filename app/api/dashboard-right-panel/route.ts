import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const authResult = await auth();

    console.log("RIGHT PANEL AUTH:", authResult);

    const { userId } = authResult;

    if (!userId) {
      console.log("RIGHT PANEL: NO USER ID");

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("RIGHT PANEL USER ID:", userId);

    const { data, error } = await supabase
      .from("interview_history")
      .select("role, score, created_at")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(
        "Dashboard Right Panel Supabase error:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      interviews: data || [],
    });
  } catch (error) {
    console.error(
      "Dashboard Right Panel error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}