import { NextRequest, NextResponse } from "next/server";
import { scoreResume } from "@/lib/ats-scorer";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  try {
    const body = await req.json();
    const { resume, jobDescription, website } = body as {
      resume?: string;
      jobDescription?: string;
      website?: string;
    };

    // Honeypot
    if (website) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!resume || resume.trim().length < 50) {
      return NextResponse.json(
        { error: "Please paste your full resume text (at least 50 characters)." },
        { status: 400 }
      );
    }
    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Please paste a job description (at least 30 characters)." },
        { status: 400 }
      );
    }

    const result = scoreResume(resume, jobDescription);
    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to score resume." }, { status: 500 });
  }
}
