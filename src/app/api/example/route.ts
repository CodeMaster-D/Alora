import { NextResponse } from 'next/server';
import { addJournalEntry, getJournals } from '@/features/journal/api';
import { verifyAuthToken } from '@/features/users/api';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);

    const body = await request.json();
    const result = await addJournalEntry(decodedToken.uid, body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('[Feature Error / POST]:', error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
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
  } catch (error: unknown) {
    console.error('[Feature Error / GET]:', error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
