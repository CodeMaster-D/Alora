import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/services/firebase/admin";
import * as admin from "firebase-admin";

async function verifyIdToken(idToken: string): Promise<{ uid: string; email?: string } | null> {
  try {
    const auth = getAdminAuth() as {
      verifyIdToken(idToken: string): Promise<{ uid: string; email?: string }>;
    };
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  if (!oobCode) {
    return NextResponse.json({ error: "Missing oobCode" }, { status: 400 });
  }

  if (!mode) {
    return NextResponse.json({ error: "Missing mode" }, { status: 400 });
  }

  if (mode !== "verifyEmail" && mode !== "resetPassword") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Firebase config missing" }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    let endpoint: string;
    const body: Record<string, string> = { oobCode };

    if (idToken) {
      body.idToken = idToken;
    }

    if (mode === "resetPassword") {
      endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`;
    } else {
      endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.message === "INVALID_ID_TOKEN" || data.error?.message === "USER_NOT_FOUND") {
        return NextResponse.json({ 
          success: false, 
          needsAuth: true,
          error: "Please sign in to verify your email" 
        }, { status: 401 });
      }
      
      return NextResponse.json({ success: false, error: data.error?.message || "Action failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      mode,
      email: data.email,
      oobCode
    });
  } catch (error) {
    console.error("[Auth Action API] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to process action code";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, oobCode, newPassword } = body;

    if (!mode) {
      return NextResponse.json({ error: "Missing mode" }, { status: 400 });
    }

    switch (mode) {
      case "resetPassword": {
        if (!oobCode) {
          return NextResponse.json({ error: "Missing oobCode" }, { status: 400 });
        }
        if (!newPassword) {
          return NextResponse.json({ error: "Missing newPassword" }, { status: 400 });
        }
        if (newPassword.length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }
        
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "Firebase config missing" }, { status: 500 });
        }
        
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oobCode, newPassword }),
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          return NextResponse.json({ 
            success: false, 
            error: data.error?.message || "Failed to reset password" 
          }, { status: 400 });
        }
        
        return NextResponse.json({ success: true });
      }
      
      case "syncVerification": {
        const authHeader = req.headers.get("authorization");
        const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!idToken) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const verifiedUser = await verifyIdToken(idToken);
        if (!verifiedUser) {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { userId } = body;
        
        if (!userId) {
          return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }
        
        if (userId !== verifiedUser.uid) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        
        try {
          const db = getAdminDb();
          const userRef = db.collection("users").doc(userId);
          await userRef.update({
            emailVerified: true,
            updatedAt: admin.firestore.Timestamp.now()
          });
          
          return NextResponse.json({
            success: true,
            emailVerified: true
          });
        } catch (error) {
          console.error("Sync verification error:", error);
          return NextResponse.json({
            success: false,
            error: "Failed to sync verification status"
          }, { status: 400 });
        }
      }
      
      default:
        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
