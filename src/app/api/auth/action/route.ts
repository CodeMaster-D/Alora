import { NextRequest, NextResponse } from "next/server";
import { 
  verifyActionCode, 
  applyActionCode, 
  getUserByEmail, 
  updateUserPassword,
  updateUserEmailVerified,
  updateUserEmailInFirestore,
  getAdminDb
} from "@/services/firebase/admin";

type ActionMode = "verifyEmail" | "resetPassword" | "recoverEmail" | "verifyAndChangeEmail" | "signIn";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode") as ActionMode;

  if (!oobCode || !mode) {
    return NextResponse.json({ error: "Missing action code or mode" }, { status: 400 });
  }

  try {
    switch (mode) {
      case "signIn":
      case "verifyEmail": {
        const userRecord = await applyActionCode(oobCode);
        await updateUserEmailVerified(userRecord.uid, true);

        return NextResponse.json({
          success: true,
          mode: "verifyEmail",
          uid: userRecord.uid,
          message: "Email verified successfully"
        });
      }

      case "resetPassword": {
        try {
          const actionInfo = await verifyActionCode(oobCode);
          return NextResponse.json({
            success: true,
            mode: "resetPassword",
            email: actionInfo.email || searchParams.get("continueUrl")?.split("continueUrl=")[1] || "",
            continueUrl: searchParams.get("continueUrl")
          });
        } catch {
          return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
        }
      }

      case "recoverEmail": {
        try {
          const actionInfo = await verifyActionCode(oobCode);
          return NextResponse.json({
            success: true,
            mode: "recoverEmail",
            previousEmail: actionInfo.previousEmail,
            newEmail: actionInfo.newEmail,
            message: "Email recovery information retrieved"
          });
        } catch {
          return NextResponse.json({ error: "Invalid or expired recovery link" }, { status: 400 });
        }
      }

      case "verifyAndChangeEmail": {
        try {
          const actionInfo = await verifyActionCode(oobCode);
          return NextResponse.json({
            success: true,
            mode: "verifyAndChangeEmail",
            newEmail: actionInfo.newEmail,
            message: "New email verification successful"
          });
        } catch {
          return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action mode" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error(`Action handler error (${mode}):`, error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message, mode }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oobCode, mode, newPassword } = body;

    if (!oobCode || !mode) {
      return NextResponse.json({ error: "Missing action code or mode" }, { status: 400 });
    }

    switch (mode) {
      case "resetPassword": {
        if (!newPassword) {
          return NextResponse.json({ error: "New password is required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        try {
          const actionInfo = await verifyActionCode(oobCode);
          if (!actionInfo.email) {
            return NextResponse.json({ error: "Invalid action code" }, { status: 400 });
          }
          
          const user = await getUserByEmail(actionInfo.email);
          await updateUserPassword(user.uid, newPassword);

          return NextResponse.json({
            success: true,
            mode: "resetPassword",
            message: "Password reset successfully"
          });
        } catch {
          return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
        }
      }

      case "verifyAndChangeEmail": {
        try {
          const userRecord = await applyActionCode(oobCode);
          return NextResponse.json({
            success: true,
            mode: "verifyAndChangeEmail",
            uid: userRecord.uid,
            message: "Email updated successfully"
          });
        } catch {
          return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
        }
      }

      case "recoverEmail": {
        try {
          await applyActionCode(oobCode);
          return NextResponse.json({
            success: true,
            mode: "recoverEmail",
            message: "Email recovered successfully"
          });
        } catch {
          return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action mode" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Action POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
