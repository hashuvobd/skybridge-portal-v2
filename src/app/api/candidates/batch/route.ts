import { NextRequest, NextResponse } from 'next/server';
import { batchUpdateCandidates } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    const { candidateIds, action, city, date } = await request.json();

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No candidate IDs provided' },
        { status: 400 }
      );
    }

    const validActions = [
      'MARK_SUBMITTED',
      'MARK_APPROVED',
      'MARK_PASSPORT_IN_HAND',
      'MARK_PCC_RECEIVED',
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid batch action: ${action}` },
        { status: 400 }
      );
    }

    const result = await batchUpdateCandidates(candidateIds, action, city, date);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.count} candidate files`,
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Batch operation failed' },
      { status: 500 }
    );
  }
}
