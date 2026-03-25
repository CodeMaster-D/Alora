import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/services/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    // Admin SDK bypasses security rules, useful for master data like exercises
    const snapshot = await adminDb.collection("breathing_exercises").get();
    
    const exercises = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      success: true, 
      data: exercises 
    });

  } catch (error: any) {
    console.error("Error fetching breathing rituals via Admin SDK:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
