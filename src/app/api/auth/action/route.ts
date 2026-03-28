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
        const actionInfo = await verifyActionCode(oobCode);
        const userRecord = await applyActionCode(oobCode);
        
        await updateUserEmailVerified(userRecord.uid, true);

        return NextResponse.json({
          success: true,
          mode: "verifyEmail",
          email: actionInfo.email,
          message: "Email verified successfully"
        });
      }

      case "resetPassword": {
        const actionInfo = await verifyActionCode(oobCode);
        return NextResponse.json({
          success: true,
          mode: "resetPassword",
          email: actionInfo.email,
          continueUrl: searchParams.get("continueUrl")
        });
      }

      case "recoverEmail": {
        const actionInfo = await verifyActionCode(oobCode);
        return NextResponse.json({
          success: true,
          mode: "recoverEmail",
          previousEmail: actionInfo.previousEmail,
          newEmail: actionInfo.newEmail,
          message: "Email recovery information retrieved"
        });
      }

      case "verifyAndChangeEmail": {
        const actionInfo = await verifyActionCode(oobCode);
        return NextResponse.json({
          success: true,
          mode: "verifyAndChangeEmail",
          newEmail: actionInfo.newEmail,
          message: "New email verification successful"
        });
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
      }

      case "verifyAndChangeEmail": {
        const userRecord = await applyActionCode(oobCode);
        const actionInfo = await verifyActionCode(oobCode);
        
        if (actionInfo.newEmail) {
          await updateUserEmailInFirestore(userRecord.uid, actionInfo.newEmail);
        }

        return NextResponse.json({
          success: true,
          mode: "verifyAndChangeEmail",
          newEmail: actionInfo.newEmail,
          message: "Email updated successfully"
        });
      }

      case "recoverEmail": {
        await applyActionCode(oobCode);
        return NextResponse.json({
          success: true,
          mode: "recoverEmail",
          message: "Email recovered successfully"
        });
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
