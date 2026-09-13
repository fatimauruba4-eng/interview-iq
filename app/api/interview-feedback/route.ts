import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json(
        {
          error: "Question and answer are required",
        },
        {
          status: 400,
        }
      );
    }

    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `You are an expert technical interviewer.

Interview Question:

${question}

Candidate Answer:

${answer}

Evaluate the answer.

Return the response in this format:

Score: __/10

Strengths:
* Point 1
* Point 2

Weaknesses:
* Point 1
* Point 2

Suggestions:
* Point 1
* Point 2`,
        });

        break;
      } catch (error: any) {
        console.log(`Gemini attempt ${attempt} failed:`, error);

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
                "AI feedback is temporarily unavailable because the AI usage limit has been reached. Please try again later.",
              code: "AI_QUOTA_EXHAUSTED",
            },
            {
              status: 429,
            }
          );
        }

        if (attempt === 3) {
          return NextResponse.json(
            {
              error:
                "AI service is temporarily busy. Please try again.",
              code: "AI_SERVICE_BUSY",
            },
            {
              status: 503,
            }
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1500)
        );
      }
    }

    return NextResponse.json({
      feedback: response?.text || "No feedback was generated.",
    });
  } catch (error) {
    console.log("Interview Feedback API Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
        code: "AI_REQUEST_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}