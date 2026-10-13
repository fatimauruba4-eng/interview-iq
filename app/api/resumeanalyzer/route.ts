import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.6-flash";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getErrorStatus(error: unknown): number {
  if (!error || typeof error !== "object") return 0;

  const err = error as {
    status?: number;
    statusCode?: number;
    code?: number | string;
  };

  return Number(err.status || err.statusCode || err.code || 0);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }

  return String(error || "").toLowerCase();
}

function isQuotaError(error: unknown): boolean {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  return (
    status === 429 ||
    status === 402 ||
    status === 403 ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate_limit") ||
    message.includes("resource exhausted") ||
    message.includes("resource_exhausted") ||
    message.includes("billing") ||
    message.includes("credit") ||
    message.includes("too many requests") ||
    message.includes("permission denied") ||
    message.includes("api key not valid")
  );
}

function isTemporaryError(error: unknown): boolean {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  return (
    status === 408 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("internal server error") ||
    message.includes("timeout")
  );
}

async function generateResumeAnalysis(base64Pdf: string) {
  const prompt = `
You are an expert professional resume reviewer.

Analyze the uploaded resume carefully.

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

Return the answer in exactly this format:

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

Provide specific, honest, actionable feedback based on the
actual resume. Do not invent qualifications or experience.
`;

  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
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
                  text: prompt,
                },
              ],
            },
          ],
        });

        const analysis = response.text || "";

        if (!analysis.trim()) {
          throw new Error(
            "The AI returned an empty resume analysis."
          );
        }

        return analysis;
      } catch (error) {
        lastError = error;

        // Do not retry quota, billing, or authentication errors.
        if (isQuotaError(error)) {
          throw error;
        }

        // Only retry temporary server/network errors.
        if (!isTemporaryError(error)) {
          throw error;
        }

        // Wait 1 second before the second attempt.
        if (attempt === 0) {
          await delay(1000);
        }
      }
    }
  }

  throw lastError;
}

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

    if (resume.size === 0) {
      return NextResponse.json(
        { error: "The uploaded PDF is empty." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const base64Pdf = buffer.toString("base64");

    const analysis = await generateResumeAnalysis(base64Pdf);

    const scoreMatch = analysis.match(
      /Resume Score:\s*(\d{1,3})\s*\/\s*100/i
    );

    const parsedScore = scoreMatch
      ? Number(scoreMatch[1])
      : null;

    const score =
      parsedScore !== null &&
      parsedScore >= 0 &&
      parsedScore <= 100
        ? parsedScore
        : null;

    const { error } = await supabase
      .from("resume_analysis")
      .insert({
        clerk_id: userId,
        filename: resume.name,
        score,
        analysis,
      });

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        {
          error:
            "The resume was analyzed, but saving the result failed.",
          code: "DATABASE_SAVE_FAILED",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: analysis,
      score,
    });
  } catch (error: unknown) {
    console.error("Resume Analyzer Error:", error);

    if (isQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "Gemini API usage limits or billing restrictions are preventing analysis. Check your Google AI Studio usage and billing settings.",
          code: "AI_QUOTA_EXHAUSTED",
        },
        { status: 429 }
      );
    }

    if (isTemporaryError(error)) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily overloaded. Please wait a minute and try again.",
          code: "GEMINI_TEMPORARILY_UNAVAILABLE",
        },
        { status: 503 }
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