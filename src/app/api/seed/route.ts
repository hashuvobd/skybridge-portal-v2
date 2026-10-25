import { NextResponse } from 'next/server';
import { syncFromExcel } from '@/lib/syncExcel';

export async function POST() {
  try {
    const stats = await syncFromExcel();

    return NextResponse.json({
      success: true,
      message: `Safely synced ${stats.total} candidates without deleting records`,
      data: stats,
    });
  } catch (error: any) {
    console.error('Safe seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
