import { NextRequest, NextResponse } from "next/server";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_DC = process.env.MAILCHIMP_DC ?? "us1"; // data center from API key suffix

interface CapturePayload {
  email: string;
  score: number;
  jobTitle?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CapturePayload;
    const { email, score, jobTitle } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // If Mailchimp is configured, subscribe the contact
    if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID) {
      const url = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
      const payload = {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          ...(jobTitle ? { JOBTITLE: jobTitle } : {}),
          ATSSCORE: String(score),
        },
        tags: ["ats-lead-magnet"],
      };

      const mcRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!mcRes.ok) {
        const err = await mcRes.json() as { title?: string };
        // 400 Member Exists is fine — treat as success
        if (err.title !== "Member Exists") {
          console.error("Mailchimp error:", err);
          // Don't fail the user request; log and continue
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("capture-email error:", err);
    return NextResponse.json({ error: "Failed to capture email." }, { status: 500 });
  }
}
