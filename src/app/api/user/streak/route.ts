import { NextRequest, NextResponse } from "next/server";
import { adminAuth, updateStreak } from "@/services/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Verifikasi Auth Token dari Client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token content" }, { status: 401 });
    }

    // 2. Jalankan logic streak di Admin service
    const userData = await updateStreak(userId);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Kembalikan data streak terupdate
    return NextResponse.json({ 
      success: true, 
      streak: userData.active_days_streak,
      lastLoginAt: userData.lastLoginAt
    });

  } catch (error: any) {
    console.error("Streak calculation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
