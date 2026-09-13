import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

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

    const formData = await request.formData();
    const resume = formData.get("resume");

    if (!resume) {
      return NextResponse.json(
        { error: "Please upload a resume." },
        { status: 400 }
      );
    }

    if (!(resume instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file." },
        { status: 400 }
      );
    }

    if (resume.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Please upload a PDF resume." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const base64Pdf = buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              text: `
You are an expert professional resume reviewer.

Analyze this resume carefully.

Evaluate:

- Skills
- Work experience
- Projects
- Education
- Achievements
- Resume formatting
- ATS friendliness
- Overall job readiness

Give the resume a score from 0 to 100.

Return the answer exactly in this format:

Resume Score: __/100

Strengths:
* Point 1
* Point 2
* Point 3

Weaknesses:
* Point 1
* Point 2
* Point 3

Suggestions:
* Point 1
* Point 2
* Point 3
              `,
            },
          ],
        },
      ],
    });

    const analysis = response.text || "";

    if (!analysis.trim()) {
      return NextResponse.json(
        { error: "AI could not analyze the resume." },
        { status: 400 }
      );
    }

    const scoreMatch = analysis.match(/Resume Score:\s*(\d+)/i);
    const score = scoreMatch ? Number(scoreMatch[1]) : null;

    const { error } = await supabase
      .from("resume_analysis")
      .insert({
        clerk_id: userId,
        filename: resume.name,
        score: score,
        analysis: analysis,
      });

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      result: analysis,
      score: score,
    });
  } catch (error: any) {
    console.error("Resume Analyzer Error:", error);

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
            "AI resume analysis is temporarily unavailable because the AI usage limit has been reached. Please try again later.",
          code: "AI_QUOTA_EXHAUSTED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while analyzing the resume.",
        code: "AI_REQUEST_FAILED",
      },
      { status: 500 }
    );
  }
}