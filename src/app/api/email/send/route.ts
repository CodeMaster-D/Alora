import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/services/emailjs";
import { generateEmailVerificationLink, generatePasswordResetLink } from "@/services/firebase/action-links";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email, name } = body;

    if (!type || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "verification": {
        const { oobLink } = await generateEmailVerificationLink(email);
        result = await sendVerificationEmail({
          to_email: email,
          to_name: name || "User",
          verify_link: oobLink,
          from_name: "Alora",
        });
        break;
      }

      case "password_reset": {
        const { oobLink } = await generatePasswordResetLink(email);
        result = await sendPasswordResetEmail({
          to_email: email,
          to_name: name || "User",
          reset_link: oobLink,
          from_name: "Alora",
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error: unknown) {
    console.error("Email API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
