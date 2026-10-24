import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PipelineStage } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { candidateIds, action, city, date } = await request.json();

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No candidate IDs provided' },
        { status: 400 }
      );
    }

    const todayStr = date || new Date().toLocaleDateString('en-GB');

    if (action === 'MARK_SUBMITTED') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              submissionSlip: true,
              submissionDate: todayStr,
              stage: 'SUBMITTED',
              auditLogs: {
                create: {
                  action: 'BATCH_SUBMITTED',
                  actor: 'Operations Admin',
                  details: `Batch marked submission slip received on ${todayStr}`,
                },
              },
            },
          })
        )
      );
    } else if (action === 'MARK_APPROVED') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              approval: true,
              approvalDate: todayStr,
              approvalCity: city || 'Strumica',
              stage: 'APPROVED',
              auditLogs: {
                create: {
                  action: 'BATCH_APPROVED',
                  actor: 'Operations Admin',
                  details: `Batch approved for ${city || 'Strumica'} on ${todayStr}`,
                },
              },
            },
          })
        )
      );
    } else if (action === 'MARK_PASSPORT_IN_HAND') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              passportInHand: true,
              auditLogs: {
                create: {
                  action: 'BATCH_PASSPORT_RECEIVED',
                  actor: 'Operations Admin',
                  details: 'Physical passport deposited at Sky Bridge Ops desk',
                },
              },
            },
          })
        )
      );
    } else if (action === 'MARK_PCC_RECEIVED') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              pccReceived: true,
              auditLogs: {
                create: {
                  action: 'BATCH_PCC_RECEIVED',
                  actor: 'Operations Admin',
                  details: 'Police Clearance Certificate verified and filed',
                },
              },
            },
          })
        )
      );
    } else {
      return NextResponse.json(
        { success: false, error: `Invalid batch action: ${action}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${candidateIds.length} candidate files`,
    });
  } catch (error: any) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Batch operation failed' },
      { status: 500 }
    );
  }
}
