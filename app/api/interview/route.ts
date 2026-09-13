import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role, experience, questionCount } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
Generate ${questionCount || 5} interview questions for a ${role} with ${experience || "entry-level"} experience.

Return only the interview questions in a numbered list.
      `,
    });

    return NextResponse.json({
      result: response.text,
    });
  } catch (error: any) {
    console.error("Interview API Error:", error);

    const errorMessage = String(
      error?.message || error?.statusText || error || ""
    ).toLowerCase();

    const errorStatus = Number(
      error?.status || error?.statusCode || 0
    );

    const isQuotaError =
      errorStatus === 429 ||
      errorStatus === 402 ||
      errorStatus === 403 ||
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("rate_limit") ||
      errorMessage.includes("resource exhausted") ||
      errorMessage.includes("resource_exhausted") ||
      errorMessage.includes("billing") ||
      errorMessage.includes("credit") ||
      errorMessage.includes("too many requests");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "AI interview is temporarily unavailable because the AI usage limit has been reached. Please try again later.",
          code: "AI_QUOTA_EXHAUSTED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Something went wrong. Please try again later.",
        code: "AI_REQUEST_FAILED",
      },
      { status: 500 }
    );
  }
}