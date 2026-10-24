import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/dataService';

export async function GET() {
  try {
    const result = await getDashboardMetrics();

    return NextResponse.json({
      success: true,
      data: result.metrics,
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
    console.error('Error computing dashboard metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
