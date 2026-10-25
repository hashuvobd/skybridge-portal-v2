import { NextRequest, NextResponse } from 'next/server';
import { updateCandidate, deleteCandidate } from '@/lib/dataService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateCandidate(id, body);

    if (!result.candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.candidate,
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update candidate record' },
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
    const result = await deleteCandidate(id);

    return NextResponse.json({
      success: true,
      message: 'Candidate deleted',
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
