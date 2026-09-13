import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
try {
const { data, error } = await supabase
.from("question_bank")
.select("id, questions, experience");


if (error) {
  console.error("Supabase error:", error);

  return NextResponse.json(
    {
      error: error.message,
      questions: [],
    },
    { status: 500 }
  );
}

return NextResponse.json({
  questions: data ?? [],
});


} catch (error) {
console.error("Question Bank API error:", error);


return NextResponse.json(
  {
    error: "Something went wrong",
    questions: [],
  },
  { status: 500 }
);


}
}
