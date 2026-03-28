import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/services/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("breathing_exercises").get();
    
    const exercises = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      success: true, 
      data: exercises 
    });

  } catch (error: unknown) {
    console.error("Error fetching breathing rituals via Admin SDK:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}
