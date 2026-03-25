import { NextResponse } from 'next/server';
import { addJournalEntry, getJournals } from '@/features/journal/api';
import { verifyAuthToken } from '@/features/users/api';

// Example Backend Route strictly following the requested AGENTS.md

// POST handler mapping to a Zod-validated Feature layer
export async function POST(request: Request) {
  try {
    // 1. Auth check with Firebase Admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);

    // 2. Extracted Body
    const body = await request.json();
    
    // 3. Domain Logic (Zod Validation + Data Parsing handled in the 'api' layer)
    const result = await addJournalEntry(decodedToken.uid, body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Feature Error / POST]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 } // Often 400 for Zod parsing errors and validation failures!
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);

    const journals = await getJournals(decodedToken.uid);

    return NextResponse.json({ success: true, data: journals });
  } catch (error: any) {
    console.error('[Feature Error / GET]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
