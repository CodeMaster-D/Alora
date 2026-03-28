import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/services/emailjs";
import { generateEmailVerificationLink, generatePasswordResetLink } from "@/services/firebase/action-links";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email, name } = body;

    console.log("[Email API] Request received:", { type, email, name });

    if (!type || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    let result;

    try {
      switch (type) {
        case "verification": {
          console.log("[Email API] Generating verification link for:", email);
          const { oobLink } = await generateEmailVerificationLink(email);
          console.log("[Email API] Got oobLink:", oobLink);
          
          result = await sendVerificationEmail({
            to_email: email,
            to_name: name || "User",
            verify_link: oobLink,
            from_name: "Alora",
          });
          console.log("[Email API] EmailJS result:", result);
          break;
        }

        case "password_reset": {
          console.log("[Email API] Generating reset link for:", email);
          const { oobLink } = await generatePasswordResetLink(email);
          console.log("[Email API] Got oobLink:", oobLink);
          
          result = await sendPasswordResetEmail({
            to_email: email,
            to_name: name || "User",
            reset_link: oobLink,
            from_name: "Alora",
          });
          console.log("[Email API] EmailJS result:", result);
          break;
        }

        default:
          return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
      }
    } catch (firebaseError) {
      console.error("[Email API] Firebase error:", firebaseError);
      const message = firebaseError instanceof Error ? firebaseError.message : "Failed to generate action link";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
  } catch (error: unknown) {
    console.error("[Email API] General error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
