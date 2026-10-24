import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PipelineStage } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Merge updates
    const updatedApproval = body.approval !== undefined ? body.approval : existing.approval;
    const updatedSubmission = body.submissionSlip !== undefined ? body.submissionSlip : existing.submissionSlip;
    const updatedPassportInHand = body.passportInHand !== undefined ? body.passportInHand : existing.passportInHand;
    const updatedPcc = body.pccReceived !== undefined ? body.pccReceived : existing.pccReceived;
    const updatedCity = body.approvalCity !== undefined ? body.approvalCity : existing.approvalCity;

    // Recalculate stage
    let nextStage: PipelineStage = 'INTAKE';
    if (updatedApproval) {
      if (updatedPassportInHand && updatedPcc) {
        nextStage = 'DEPLOYMENT_READY';
      } else {
        nextStage = 'APPROVED';
      }
    } else if (updatedSubmission) {
      nextStage = 'SUBMITTED';
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        ...body,
        stage: nextStage,
        auditLogs: {
          create: {
            action: 'CELL_UPDATE',
            actor: 'Operations Admin',
            details: `Updated fields: ${Object.keys(body).join(', ')} -> Stage: ${nextStage}`,
          },
        },
      },
      include: {
        agent: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
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
    await prisma.candidate.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Candidate deleted' });
  } catch (error: any) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
