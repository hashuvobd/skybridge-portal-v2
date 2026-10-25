import { NextRequest, NextResponse } from 'next/server';
import { updateAgent, deleteAgent } from '@/lib/dataService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateAgent(id, body);

    if (!result.agent) {
      return NextResponse.json(
        { success: false, error: 'Partner agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.agent,
      isDummy: result.isDummy,
    });
  } catch (error: any) {
    console.error('Error updating partner agency:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A partner agency with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update partner agency' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteAgent(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Partner agency not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Partner agency deleted successfully (candidates safely preserved)',
      isDummy: result.isDummy,
    });
  } catch (error: any) {
    console.error('Error deleting partner agency:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete partner agency' },
      { status: 500 }
    );
  }
}
