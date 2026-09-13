import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function POST(request: Request) {
try {
const { userId } = await auth();


if (!userId) {
  return NextResponse.json(
    {
      message: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

const body = await request.json();

console.log("Settings POST body:", body);
console.log("Clerk user ID:", userId);

const { userName, email, preferredRole } = body;

if (!userName || !email || !preferredRole) {
  return NextResponse.json(
    {
      message: "All fields are required",
    },
    {
      status: 400,
    }
  );
}

const { data: existingSettings, error: findError } = await supabase
  .from("settings")
  .select("id")
  .eq("clerk_id", userId)
  .maybeSingle();

if (findError) {
  console.error("Settings find error:", findError);

  return NextResponse.json(
    {
      message: findError.message,
    },
    {
      status: 500,
    }
  );
}

let error;

if (existingSettings) {
  console.log("Updating existing settings");

  ({ error } = await supabase
    .from("settings")
    .update({
      username: userName,
      email,
      preferred_role: preferredRole,
    })
    .eq("clerk_id", userId));
} else {
  console.log("Creating new settings");

  ({ error } = await supabase
    .from("settings")
    .insert({
      clerk_id: userId,
      username: userName,
      email,
      preferred_role: preferredRole,
    }));
}

if (error) {
  console.error("Settings save error:", error);

  return NextResponse.json(
    {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    },
    {
      status: 500,
    }
  );
}

return NextResponse.json(
  {
    message: "Settings Saved Successfully!",
    userName,
    email,
    preferredRole,
  },
  {
    status: 200,
  }
);


} catch (error) {
console.error("Settings POST unexpected error:", error);


return NextResponse.json(
  {
    message: "Something went wrong",
    error: error instanceof Error ? error.message : String(error),
  },
  {
    status: 500,
  }
);


}
}

export async function GET() {
try {
const { userId } = await auth();


if (!userId) {
  return NextResponse.json(
    {
      message: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

const { data, error } = await supabase
  .from("settings")
  .select("*")
  .eq("clerk_id", userId)
  .maybeSingle();

if (error) {
  console.error("Settings GET error:", error);

  return NextResponse.json(
    {
      message: error.message,
    },
    {
      status: 500,
    }
  );
}

return NextResponse.json({
  userName: data?.username ?? "",
  email: data?.email ?? "",
  preferredRole: data?.preferred_role ?? "",
});


} catch (error) {
console.error("Settings GET unexpected error:", error);


return NextResponse.json(
  {
    message: "Something went wrong",
  },
  {
    status: 500,
  }
);


}
}
