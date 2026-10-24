import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/dataService';

export async function GET() {
  try {
    const result = await getAgents();

    return NextResponse.json({
      success: true,
      data: result.agents,
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent directory' },
      { status: 500 }
    );
  }
}
