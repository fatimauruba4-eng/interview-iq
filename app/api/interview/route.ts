import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const MODELS = ["gemini-3.8-flash", "gemini-3.6-flash"];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getErrorStatus(error: unknown): number {
  if (!error || typeof error !== "object") return 0;

  const e = error as {
    status?: number;
    statusCode?: number;
    code?: number | string;
  };

  return Number(e.status || e.statusCode || e.code || 0);
}

function getErrorMessage(error: unknown): string {
  return (
    error instanceof Error
      ? error.message
      : String(error || "")
  ).toLowerCase();
}

function isQuotaError(error: unknown): boolean {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  return (
    status === 429 ||
    status === 402 ||
    status === 403 ||
    message.includes("quota") ||
    message.includes("resource exhausted") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit") ||
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
    [408, 500, 502, 503, 504].includes(status) ||
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("timeout") ||
    message.includes("internal server error")
  );
}

async function generateQuestions(
  role: string,
  experience: string,
  questionCount: number
): Promise<string> {
  const prompt = `
Generate ${questionCount} interview questions for a ${role}
candidate with ${experience} experience.

Requirements:
- Make the questions relevant to the specified role.
- Match the candidate's experience level.
- Include practical and technical questions where appropriate.
- Return only the interview questions in a numbered list.
- Do not include answers, introductions, or explanations.
`;

  let lastError: unknown;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const result = response.text?.trim();

        if (!result) {
          throw new Error(
            "Gemini returned an empty interview question list."
          );
        }

        return result;
      } catch (error: unknown) {
        lastError = error;

        if (isQuotaError(error)) {
          throw error;
        }

        if (!isTemporaryError(error)) {
          throw error;
        }

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

    let body: {
      role?: unknown;
      experience?: unknown;
      questionCount?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { role, experience, questionCount } = body;

    if (typeof role !== "string" || !role.trim()) {
      return NextResponse.json(
        { error: "Role is required." },
        { status: 400 }
      );
    }

    if (role.length > 150) {
      return NextResponse.json(
        { error: "Role must be 150 characters or fewer." },
        { status: 400 }
      );
    }

    if (
      experience !== undefined &&
      (typeof experience !== "string" ||
        experience.length > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid experience level." },
        { status: 400 }
      );
    }

    const count = Number(questionCount ?? 5);

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 20
    ) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 20." },
        { status: 400 }
      );
    }

    const result = await generateQuestions(
      role.trim(),
      typeof experience === "string" && experience.trim()
        ? experience.trim()
        : "entry-level",
      count
    );

    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("Interview API Error:", error);

    if (isQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "Gemini usage limits or billing restrictions are preventing interview question generation. Check your Google AI Studio usage and billing settings.",
          code: "AI_QUOTA_EXHAUSTED",
        },
        { status: 429 }
      );
    }

    if (isTemporaryError(error)) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily unavailable. Please wait a minute and try again.",
          code: "GEMINI_TEMPORARILY_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while generating interview questions. Please try again.",
        code: "AI_REQUEST_FAILED",
      },
      { status: 500 }
    );
  }
}