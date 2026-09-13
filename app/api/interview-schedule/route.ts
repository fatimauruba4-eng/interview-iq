import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const authResult = await auth();

    console.log("INTERVIEW SCHEDULE GET AUTH:", authResult);

    const { userId } = authResult;

    if (!userId) {
      console.log("INTERVIEW SCHEDULE GET: NO USER ID");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("INTERVIEW SCHEDULE GET USER ID:", userId);

    const { data, error } = await supabase
      .from("interview_schedule")
      .select("*")
      .eq("clerk_id", userId)
      .order("scheduled_date", { ascending: true });

    if (error) {
      console.error("GET schedule database error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      schedules: data || [],
    });
  } catch (error) {
    console.error("GET schedule error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await auth();

    console.log("INTERVIEW SCHEDULE POST AUTH:", authResult);

    const { userId } = authResult;

    if (!userId) {
      console.log("INTERVIEW SCHEDULE POST: NO USER ID");

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("INTERVIEW SCHEDULE POST USER ID:", userId);

    const body = await request.json();

    const {
      role,
      scheduled_date,
      scheduled_time,
    } = body;

    if (!role || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: "Role, date and time are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("interview_schedule")
      .insert({
        clerk_id: userId,
        role,
        scheduled_date,
        scheduled_time,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) {
      console.error("POST schedule database error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      schedule: data,
    });
  } catch (error) {
    console.error("POST schedule error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}