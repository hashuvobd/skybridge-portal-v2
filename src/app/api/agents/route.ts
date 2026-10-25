import { NextRequest, NextResponse } from 'next/server';
import { getAgents, createAgent } from '@/lib/dataService';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Agency name is required' },
        { status: 400 }
      );
    }

    const result = await createAgent({
      name: body.name,
      code: body.code,
      location: body.location,
      contactPerson: body.contactPerson,
      phone: body.phone,
      email: body.email,
      notes: body.notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.agent,
        isDummy: result.isDummy,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating agent:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A partner agency with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create partner agency' },
      { status: 500 }
    );
  }
}
