
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    const profileData = {
      name: body.name || "",
      email: body.email || "",
      bio: body.bio || "",
      target: body.target || "",
      targetrole: body.targetrole || "",
      experiencelevel: body.experiencelevel || "",
      github: body.github || "",
      linkedin: body.linkedin || "",
    };

    if (existingProfile) {
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("clerk_id", userId);

      if (error) {
        console.error("UPDATE PROFILE ERROR:", error);

        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from("profiles")
        .insert([
          {
            clerk_id: userId,
            ...profileData,
          },
        ]);

      if (error) {
        console.error("INSERT PROFILE ERROR:", error);

        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
    });
  } catch (error) {
    console.error("PUT PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

