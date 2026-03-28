import { NextRequest, NextResponse } from "next/server";
import { generateEmailVerificationLink, generatePasswordResetLink } from "@/services/firebase/admin";

async function sendEmail(type: "verification" | "password_reset", email: string, name: string, link: string) {
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.USE_ETHEREAL === "true";
  
  if (isDevelopment) {
    const { sendVerificationEmail, sendPasswordResetEmail } = await import("@/services/ethereal");
    
    if (type === "verification") {
      return sendVerificationEmail({ to_email: email, to_name: name, verify_link: link });
    } else {
      return sendPasswordResetEmail({ to_email: email, to_name: name, reset_link: link });
    }
  } else {
    const { sendVerificationEmail, sendPasswordResetEmail } = await import("@/services/resend");
    
    if (type === "verification") {
      return sendVerificationEmail({ to_email: email, to_name: name, verify_link: link });
    } else {
      return sendPasswordResetEmail({ to_email: email, to_name: name, reset_link: link });
    }
  }
}

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

    try {
      let link: string;
      
      if (type === "verification") {
        console.log("[Email API] Generating verification link for:", email);
        const result = await generateEmailVerificationLink(email);
        link = result.oobLink;
        console.log("[Email API] Got oobLink:", link);
      } else if (type === "password_reset") {
        console.log("[Email API] Generating reset link for:", email);
        const result = await generatePasswordResetLink(email);
        link = result.oobLink;
        console.log("[Email API] Got oobLink:", link);
      } else {
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
      }

      const result = await sendEmail(type, email, name || "User", link);
      
      if (result.success) {
        console.log("[Email API] Email sent successfully");
        const previewUrl = (result as { previewUrl?: string }).previewUrl;
        if (previewUrl) {
          console.log("[Email API] Preview URL:", previewUrl);
          return NextResponse.json({ success: true, previewUrl });
        }
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    } catch (firebaseError) {
      console.error("[Email API] Firebase error:", firebaseError);
      const message = firebaseError instanceof Error ? firebaseError.message : "Failed to generate action link";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("[Email API] General error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
